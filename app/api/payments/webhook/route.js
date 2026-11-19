import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPaystackConfig, getSupabaseAdmin, settlePaystackPayment, verifyPaystackTransaction } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";
    const { secretKey } = getPaystackConfig();
    const expected = createHmac("sha512", secretKey).update(body).digest("hex");
    const suppliedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const event = JSON.parse(body);
    if (event.event !== "charge.success" || !event.data?.reference) {
      return NextResponse.json({ received: true });
    }

    const transaction = await verifyPaystackTransaction(event.data.reference);
    await settlePaystackPayment(getSupabaseAdmin(), transaction);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
