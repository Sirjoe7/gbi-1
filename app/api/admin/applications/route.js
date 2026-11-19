import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    if (auth.user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
    }

    const { data, error } = await auth.supabase
      .from("applications")
      .select("id, reference, details, status, cv_path, submitted_at, created_at, payments(status, paystack_reference, amount_minor, currency, paid_at)")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load applications.");

    return NextResponse.json({ applications: data });
  } catch (error) {
    console.error("Admin application lookup failed:", error);
    return NextResponse.json({ error: error.message || "Admin service is unavailable." }, { status: 503 });
  }
}
