import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { qrId } = await request.json();

    if (!qrId) {
      return Response.json({ error: "QR ID is required" }, { status: 400 });
    }

    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the QR code exists and belongs to the user
    const { data: qr, error: qrError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", qrId)
      .eq("user_id", user.id)
      .single();

    if (qrError || !qr) {
      return Response.json({ error: "QR code not found" }, { status: 404 });
    }

    // Check if already paid
    if (qr.is_editable) {
      return Response.json(
        { error: "QR code is already unlocked" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Dynamic QR Edit Unlock" },
            unit_amount: 199, // $1.99
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?qr_id=${qrId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      metadata: {
        qrId,
        userId: user.id,
      },
      customer_email: user.email,
    });

    return Response.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
