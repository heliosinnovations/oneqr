import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await context.params;

  // Create Supabase client
  const supabase = await createClient();

  // Look up QR code by short_code
  const { data: qr, error } = await supabase
    .from("qr_codes")
    .select("destination_url, qr_type, original_url")
    .eq("short_code", shortCode)
    .single();

  if (error || !qr) {
    return new Response("QR code not found", { status: 404 });
  }

  // Only dynamic QRs use redirect server
  if (qr.qr_type !== "dynamic") {
    return new Response("Invalid QR code type", { status: 400 });
  }

  // Redirect to destination URL (or fallback to original)
  const redirectUrl = qr.destination_url || qr.original_url;

  if (!redirectUrl) {
    return new Response("No destination URL set", { status: 500 });
  }

  // 302 redirect (temporary, allows changing destination later)
  return Response.redirect(redirectUrl, 302);
}
