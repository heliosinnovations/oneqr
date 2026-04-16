import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return Response.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { qrId, userId } = session.metadata || {};

    if (!qrId || !userId) {
      console.error("Missing metadata in checkout session:", session.id);
      return Response.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();

      // Update QR code to be editable
      const { error: qrUpdateError } = await supabase
        .from("qr_codes")
        .update({
          is_editable: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", qrId)
        .eq("user_id", userId);

      if (qrUpdateError) {
        console.error("Failed to update QR code:", qrUpdateError);
        return Response.json(
          { error: "Failed to update QR code" },
          { status: 500 }
        );
      }

      // Record the payment
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        stripe_payment_intent_id:
          (session.payment_intent as string) || session.id,
        amount: session.amount_total || 199,
        currency: session.currency || "usd",
        plan_type: "single",
        status: "succeeded",
      });

      if (paymentError) {
        console.error("Failed to record payment:", paymentError);
        // Don't fail the webhook - QR is already unlocked
      }

      console.log(`Successfully unlocked QR ${qrId} for user ${userId}`);
    } catch (error) {
      console.error("Error processing checkout completion:", error);
      return Response.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return Response.json({ received: true });
}
