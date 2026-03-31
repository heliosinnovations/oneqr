import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { priceId, qrCodeId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Validate price ID against allowed prices
    const allowedPrices = [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED,
    ];

    if (!allowedPrices.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Get current user if logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Determine plan type from price ID
    const planType =
      priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED
        ? "unlimited"
        : "single";

    // Build success URL with session ID placeholder and optional qrCodeId
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const qrParam = qrCodeId ? `&qr_id=${qrCodeId}` : "";
    const successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}${qrParam}`;
    const cancelUrl = `${origin}/payment/cancelled`;

    // Create Stripe Checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user?.id || "",
        plan_type: planType,
        qr_code_id: qrCodeId || "",
      },
      customer_email: user?.email || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
