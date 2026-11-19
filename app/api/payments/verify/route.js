import { NextResponse } from "next/server";
import { getSiteUrl, getSupabaseAdmin, settlePaystackPayment, verifyPaystackTransaction } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const siteUrl = getSiteUrl(request);
  const reference = new URL(request.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/dashboard?payment=failed`);
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    const paid = await settlePaystackPayment(getSupabaseAdmin(), transaction);
    return NextResponse.redirect(`${siteUrl}/dashboard?payment=${paid ? "success" : "failed"}`);
  } catch (error) {
    console.error("Paystack return verification failed:", error);
    return NextResponse.redirect(`${siteUrl}/dashboard?payment=failed`);
  }
}
