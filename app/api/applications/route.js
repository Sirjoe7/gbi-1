import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseAdmin } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

function databaseError(error, fallback) {
  console.error(fallback, error);
  if (["42703", "PGRST200", "PGRST204"].includes(error?.code)) {
    return errorResponse(
      "The Supabase database schema is outdated. Run supabase/migrations/20261119_defer_email_verification.sql in the Supabase SQL Editor.",
      503,
    );
  }
  return errorResponse(fallback, 500);
}

function applicationTokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function applicationToken(request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.match(/^Application ([a-f0-9]{64})$/i)?.[1] || null;
}

function validateDetails(details) {
  const required = [
    "first_name", "last_name", "name", "email", "dob", "phone", "country", "institution",
    "education", "status", "course", "gradyear", "employment",
    "skills", "m1", "m2", "m3", "m5",
  ];
  if (required.some((key) => typeof details[key] !== "string" || !details[key].trim())) {
    return "Complete all required application fields.";
  }
  if (!/^\S+@\S+\.\S+$/.test(details.email)) {
    return "Enter a valid email address.";
  }
  if (details.c1 !== true || details.c2 !== true) {
    return "Confirm the application accuracy and payment terms.";
  }

  const birth = new Date(`${details.dob}T00:00:00Z`);
  const eventDate = new Date("2027-04-03T00:00:00Z");
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== details.dob) {
    return "Enter a valid date of birth.";
  }
  let age = eventDate.getUTCFullYear() - birth.getUTCFullYear();
  if (
    eventDate.getUTCMonth() < birth.getUTCMonth() ||
    (eventDate.getUTCMonth() === birth.getUTCMonth() &&
      eventDate.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  if (age < 18 || age > 40) return "Applicants must be aged 18 to 40 by 3 April 2027.";
  if (details.m1.trim().length < 40) return "Expand your response to the first motivation question.";

  return null;
}

export async function GET(request) {
  try {
    const token = applicationToken(request);
    if (token) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("applications")
        .select("id, reference, email, details, status, submitted_at, created_at, payments(status, paystack_reference, amount_minor, currency, paid_at, created_at)")
        .eq("claim_token_hash", applicationTokenHash(token))
        .maybeSingle();
      if (error) return databaseError(error, "Could not load application by access token.");
      if (!data) return errorResponse("Application access has expired. Sign in to continue.", 404);
      return NextResponse.json({ application: data });
    }

    const auth = await getAuthenticatedUser(request);
    if (!auth) return errorResponse("Sign in to view your application.", 401);

    let { data, error } = await auth.supabase
      .from("applications")
      .select("id, reference, email, details, status, submitted_at, created_at, payments(status, paystack_reference, amount_minor, currency, paid_at, created_at)")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) return databaseError(error, "Could not load application for signed-in user.");

    if (!data && (auth.user.email_confirmed_at || auth.user.confirmed_at) && auth.user.email) {
      const { data: orphanedApplication, error: claimLookupError } = await auth.supabase
        .from("applications")
        .select("id, status")
        .eq("email", auth.user.email.toLowerCase())
        .is("user_id", null)
        .in("status", ["awaiting_payment", "awaiting_email_verification", "submitted"])
        .maybeSingle();
      if (claimLookupError) return databaseError(claimLookupError, "Could not find an existing application to link.");

      if (orphanedApplication) {
        const { data: paidPayment, error: paymentLookupError } = await auth.supabase
          .from("payments")
          .select("id")
          .eq("application_id", orphanedApplication.id)
          .eq("status", "paid")
          .limit(1)
          .maybeSingle();
        if (paymentLookupError) return databaseError(paymentLookupError, "Could not check the existing application payment.");
        const submitted = orphanedApplication.status === "submitted" ||
          orphanedApplication.status === "awaiting_email_verification" ||
          Boolean(paidPayment);
        const { error: claimError } = await auth.supabase
          .from("applications")
          .update({
            user_id: auth.user.id,
            claim_token_hash: null,
            status: submitted ? "submitted" : orphanedApplication.status,
            submitted_at: submitted ? new Date().toISOString() : null,
          })
          .eq("id", orphanedApplication.id)
          .is("user_id", null);
        if (claimError) return databaseError(claimError, "Could not link the existing application.");

        const { error: paymentError } = await auth.supabase
          .from("payments")
          .update({ user_id: auth.user.id })
          .eq("application_id", orphanedApplication.id);
        if (paymentError) return databaseError(paymentError, "Could not link the existing application payments.");

        ({ data, error } = await auth.supabase
          .from("applications")
          .select("id, reference, email, details, status, submitted_at, created_at, payments(status, paystack_reference, amount_minor, currency, paid_at, created_at)")
          .eq("user_id", auth.user.id)
          .maybeSingle());
        if (error) return databaseError(error, "Could not load claimed application.");
      }
    }

    const metadata = auth.user.user_metadata || {};
    const names = String(metadata.full_name || metadata.name || "").trim().split(/\s+/);
    return NextResponse.json({
      application: data,
      profile: {
        id: auth.user.id,
        first_name: metadata.first_name || names[0] || "",
        last_name: metadata.last_name || names.slice(1).join(" "),
        email: auth.user.email || "",
        phone: metadata.phone || "",
      },
    });
  } catch (error) {
    console.error("Application lookup failed:", error);
    return errorResponse("Application service is not configured.", 503);
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) return errorResponse("Sign in with Google before saving an application.", 401);
    if (!(auth.user.email_confirmed_at || auth.user.confirmed_at)) {
      return errorResponse("Use a Google account with a verified email address before saving an application.", 403);
    }

    const supabase = auth.supabase;
    const metadata = auth.user.user_metadata || {};
    const names = String(metadata.full_name || metadata.name || "").trim().split(/\s+/);
    const form = await request.formData();
    const detailsText = form.get("details");
    if (typeof detailsText !== "string") {
      return errorResponse("Application details are required.");
    }

    let details;
    try {
      details = JSON.parse(detailsText);
    } catch {
      return errorResponse("Application details are invalid.");
    }
    if (!details || typeof details !== "object" || Array.isArray(details)) {
      return errorResponse("Application details are invalid.");
    }
    delete details.city;
    delete details.field;
    delete details.m4;
    if (details.employment === "Employed" || details.employment === "Self-employed") {
      details.role = typeof details.role === "string" ? details.role.trim() : "";
    } else {
      delete details.role;
    }
    details.first_name =
      typeof details.first_name === "string"
        ? details.first_name.trim()
        : metadata.first_name || names[0] || "";
    details.last_name =
      typeof details.last_name === "string"
        ? details.last_name.trim()
        : metadata.last_name || names.slice(1).join(" ");
    details.name = [details.first_name, details.last_name].filter(Boolean).join(" ");
    details.email = (auth.user.email || "").trim().toLowerCase();
    details.phone = typeof details.phone === "string" ? details.phone.trim() : metadata.phone || "";
    const validationError = validateDetails(details);
    if (validationError) return errorResponse(validationError, 400);

    const { data: existing, error: lookupError } = await supabase
      .from("applications")
      .select("id, reference, status, cv_path")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (lookupError) return databaseError(lookupError, "Could not load the existing application.");
    if (existing && !["draft", "awaiting_payment"].includes(existing.status)) {
      return errorResponse("A submitted application cannot be changed.", 409);
    }

    let cvPath = existing?.cv_path || null;
    const applicationId = existing?.id || crypto.randomUUID();
    const cv = form.get("cv");
    if (cv instanceof File && cv.size > 0) {
      const signature = Buffer.from(await cv.slice(0, 5).arrayBuffer()).toString("ascii");
      if (signature !== "%PDF-" || cv.size > 5 * 1024 * 1024) {
        return errorResponse("CV must be a PDF no larger than 5 MB.");
      }

      const safeName = cv.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      cvPath = `${applicationId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(cvPath, cv, { contentType: "application/pdf", upsert: false });
      if (uploadError) {
        console.error("CV upload failed:", uploadError);
        return errorResponse("Could not upload your CV. Please try again.", 500);
      }
    }
    if (!cvPath) return errorResponse("Upload your CV before continuing.");

    const row = {
      email: details.email,
      claim_token_hash: null,
      details,
      cv_path: cvPath,
      status: "awaiting_payment",
      user_id: auth.user.id,
    };
    const saveQuery = existing
      ? supabase
          .from("applications")
          .update(row)
          .eq("id", existing.id)
          .in("status", ["draft", "awaiting_payment"])
          .select("id, reference, status")
          .maybeSingle()
      : supabase
          .from("applications")
          .insert({
            ...row,
            id: applicationId,
            reference: `GBI-27-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          })
          .select("id, reference, status")
          .single();
    const { data, error } = await saveQuery;
    if (error) {
      console.error("Application save failed:", error);
      if (error.code === "23505") {
        return errorResponse("An application already exists for this account.", 409);
      }
      return errorResponse("Could not save your application.", 500);
    }
    if (!data) return errorResponse("Payment has already been processed; the application can no longer be changed.", 409);

    return NextResponse.json({ application: data });
  } catch (error) {
    console.error("Application save failed:", error);
    return errorResponse("Application service is not configured.", 503);
  }
}
