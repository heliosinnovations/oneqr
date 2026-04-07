import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the session with Stripe
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", isEditable: false },
        { status: 400 }
      );
    }

    // Extract QR code ID from metadata
    const qrCodeId = session.metadata?.qr_code_id;

    if (!qrCodeId) {
      // No QR code to update (might be subscription or other payment)
      return NextResponse.json({ success: true, isEditable: false });
    }

    // Update the QR code with server-side permissions (bypasses RLS)
    const supabase = await createClient();
    const { error } = await supabase
      .from("qr_codes")
      .update({
        is_editable: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCodeId);

    if (error) {
      console.error("Error updating QR code:", error);
      return NextResponse.json(
        { error: "Failed to update QR code", isEditable: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, isEditable: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", isEditable: false },
      { status: 500 }
    );
  }
}
