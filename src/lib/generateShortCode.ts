import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a random short code using lowercase alphanumeric characters.
 * @param length - The length of the short code (default: 6)
 * @returns A random short code string
 */
export function generateShortCode(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique short code by checking against existing codes in the database.
 * Will retry up to 10 times before throwing an error.
 * @param supabase - The Supabase client instance
 * @returns A unique short code that doesn't exist in the database
 * @throws Error if unable to generate a unique code after 10 attempts
 */
export async function generateUniqueShortCode(
  supabase: SupabaseClient
): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateShortCode();
    const { data } = await supabase
      .from("qr_codes")
      .select("short_code")
      .eq("short_code", code)
      .single();

    if (!data) return code; // Unique code found
    attempts++;
  }
  throw new Error("Failed to generate unique short code");
}
