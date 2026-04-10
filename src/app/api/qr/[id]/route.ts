import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface QRCustomizationData {
  foreground_color?: string;
  background_color?: string;
  pattern?: string;
  corner_style?: string;
  error_level?: string;
  text_above?: string;
  text_below?: string;
  text_font_size?: number;
  text_font_weight?: string;
  text_font_family?: string;
  text_color?: string;
}

interface UpdatePayload {
  qr_data?: QRCustomizationData;
  destination_url?: string;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { qr_data, destination_url } = body as UpdatePayload;

    // Get the current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the QR code to verify ownership and check is_editable
    const { data: qrCode, error: fetchError } = await supabase
      .from("qr_codes")
      .select("user_id, is_editable")
      .eq("id", id)
      .single();

    if (fetchError || !qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (qrCode.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: { qr_data?: QRCustomizationData; destination_url?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    // Always allow qr_data updates (style customizations)
    if (qr_data) {
      updateData.qr_data = qr_data;
    }

    // Only allow destination_url update if is_editable is true
    if (destination_url !== undefined) {
      if (!qrCode.is_editable) {
        return NextResponse.json(
          { error: "QR code is not editable. Please unlock to change destination URL." },
          { status: 403 }
        );
      }
      updateData.destination_url = destination_url;
    }

    // Use admin client to bypass RLS for qr_data updates
    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase
      .from("qr_codes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id); // Extra safety check

    if (updateError) {
      console.error("Error updating QR code:", updateError);
      return NextResponse.json(
        { error: "Failed to update QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update QR error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
