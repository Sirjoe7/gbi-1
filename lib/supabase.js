import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getAuthenticatedUser(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { supabase, user: data.user };
}

export function getPaystackConfig() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY must be configured.");

  const amount = Number(process.env.PAYSTACK_AMOUNT_MINOR || 2000);
  const currency = process.env.PAYSTACK_CURRENCY || "USD";
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("PAYSTACK_AMOUNT_MINOR must be a positive integer.");
  }

  return { secretKey, amount, currency };
}

export function getSiteUrl(request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, "");
}

export async function verifyPaystackTransaction(reference) {
  const { secretKey } = getPaystackConfig();
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" },
  );
  const result = await response.json();

  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Could not verify the Paystack transaction.");
  }

  return result.data;
}

export async function settlePaystackPayment(supabase, transaction) {
  const reference = transaction.reference;
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, application_id, amount_minor, currency, status")
    .eq("paystack_reference", reference)
    .single();

  if (paymentError || !payment) throw new Error("Payment reference was not found.");

  const { amount, currency } = getPaystackConfig();
  const matches =
    transaction.status === "success" &&
    transaction.amount === amount &&
    transaction.currency === currency &&
    payment.amount_minor === amount &&
    payment.currency === currency;

  if (!matches) {
    if (payment.status !== "paid") {
      const { error } = await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      if (error) throw new Error("Could not update payment status.");
    }
    return false;
  }

  if (payment.status !== "paid") {
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        channel: transaction.channel || null,
      })
      .eq("id", payment.id);
    if (paymentUpdateError) throw new Error("Could not save the confirmed payment.");
  }

  const { data: application, error: applicationLookupError } = await supabase
    .from("applications")
    .select("user_id")
    .eq("id", payment.application_id)
    .single();
  if (applicationLookupError || !application) throw new Error("Could not load the application after payment.");

  const { error: applicationUpdateError } = await supabase
    .from("applications")
    .update({
      status: application.user_id ? "submitted" : "awaiting_email_verification",
      submitted_at: application.user_id ? new Date().toISOString() : null,
    })
    .eq("id", payment.application_id)
    .in("status", ["awaiting_payment", "awaiting_email_verification"]);
  if (applicationUpdateError) throw new Error("Could not mark the application paid.");

  return true;
}
