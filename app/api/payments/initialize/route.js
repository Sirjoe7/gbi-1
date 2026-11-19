import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getPaystackConfig, getSiteUrl, getSupabaseAdmin } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const token = (request.headers.get("authorization") || "").match(/^Application ([a-f0-9]{64})$/i)?.[1];
    const auth = await getAuthenticatedUser(request);
    if (!auth && !token) return NextResponse.json({ error: "Sign in to continue to payment." }, { status: 401 });
    if (auth && !(auth.user.email_confirmed_at || auth.user.confirmed_at)) {
      return NextResponse.json({ error: "Verify your email before proceeding to payment." }, { status: 403 });
    }
    const supabase = getSupabaseAdmin();

    let applicationQuery = supabase
      .from("applications")
      .select("id, reference, email, status, claim_token_hash");
    if (auth) applicationQuery = applicationQuery.eq("user_id", auth.user.id);
    else applicationQuery = applicationQuery.eq("claim_token_hash", createHash("sha256").update(token).digest("hex"));
    const { data: application, error: applicationError } = await applicationQuery.maybeSingle();
    if (applicationError) throw new Error("Could not load the application.");
    if (!application) {
      return NextResponse.json({ error: "Save your application before payment." }, { status: 404 });
    }
    if (application.status !== "awaiting_payment") {
      return NextResponse.json({ error: "This application has already been submitted." }, { status: 409 });
    }

    const config = getPaystackConfig();
    const reference = `gbi_${crypto.randomUUID()}`;
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        application_id: application.id,
        user_id: auth?.user.id || null,
        paystack_reference: reference,
        amount_minor: config.amount,
        currency: config.currency,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertError) throw new Error("Could not create a payment record.");

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: application.email,
        amount: config.amount,
        currency: config.currency,
        reference,
        callback_url: `${getSiteUrl(request)}/api/payments/verify`,
        metadata: { application_reference: application.reference },
      }),
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      console.error("Paystack initialization failed:", result.message || response.status);
      return NextResponse.json(
        { error: "Paystack could not start checkout. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ authorizationUrl: result.data.authorization_url });
  } catch (error) {
    console.error("Payment initialization failed:", error);
    return NextResponse.json(
      { error: error.message || "Payment service is not configured." },
      { status: 503 },
    );
  }
}
