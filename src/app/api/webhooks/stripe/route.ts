import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Create admin client for webhook operations (bypasses RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook error: No signature");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Webhook error: No webhook secret configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const qrCodeId = session.metadata?.qr_code_id;
        const customerEmail = session.customer_email;

        console.log(`Processing checkout.session.completed:`, {
          userId,
          qrCodeId,
          customerEmail,
        });

        // Mark the specific QR code as editable
        if (qrCodeId) {
          const { error: qrError } = await supabase
            .from("qr_codes")
            .update({
              is_editable: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", qrCodeId);

          if (qrError) {
            console.error("Error updating QR code:", qrError);
          } else {
            console.log(`QR code ${qrCodeId} marked as editable`);
          }
        }

        // Record the payment
        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: userId || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_total: session.amount_total,
          currency: session.currency,
          qr_code_id: qrCodeId || null,
          customer_email: customerEmail,
          status: "completed",
          created_at: new Date().toISOString(),
        });

        if (paymentError) {
          console.error("Error recording payment:", paymentError);
        }

        console.log(
          `Payment completed for user ${userId || customerEmail}, QR code: ${qrCodeId}`
        );
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        // Most logic is handled in checkout.session.completed
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `Payment failed for PaymentIntent: ${paymentIntent.id}`,
          paymentIntent.last_payment_error?.message
        );

        // Log the failed payment
        const { error } = await supabase.from("payments").insert({
          stripe_payment_intent_id: paymentIntent.id,
          amount_total: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: "failed",
          error_message: paymentIntent.last_payment_error?.message,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error logging failed payment:", error);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        // Find the payment record and revert the QR code
        const { data: paymentRecord, error: fetchError } = await supabase
          .from("payments")
          .select("user_id, qr_code_id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (fetchError) {
          console.error("Error finding payment record:", fetchError);
        } else if (paymentRecord?.qr_code_id) {
          // Revert QR code to non-editable
          const { error: qrError } = await supabase
            .from("qr_codes")
            .update({
              is_editable: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", paymentRecord.qr_code_id);

          if (qrError) {
            console.error("Error reverting QR code:", qrError);
          }

          // Update payment record status
          const { error: updateError } = await supabase
            .from("payments")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", paymentIntentId);

          if (updateError) {
            console.error("Error updating payment status:", updateError);
          }

          console.log(
            `QR code ${paymentRecord.qr_code_id} reverted to non-editable due to refund`
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
