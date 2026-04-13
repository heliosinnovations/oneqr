/**
 * Template formatters - Convert form data to QR code content strings
 */

export interface WiFiData {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface PhoneData {
  phone: string;
}

export interface AppStoreData {
  platform: "ios" | "android" | "both";
  appUrl: string;
  androidUrl?: string;
}

export interface MapsData {
  address: string;
  label?: string;
}

export interface CalendarData {
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location?: string;
}

export interface PaymentData {
  platform: "paypal" | "venmo" | "cashapp";
  username: string;
  amount?: string;
  note?: string;
}

/**
 * Format WiFi credentials for QR code
 * Format: WIFI:S:{ssid};T:{type};P:{password};;
 */
export function formatWiFi(data: WiFiData): string {
  const escapedSSID = escapeWiFiString(data.ssid);
  const escapedPassword = escapeWiFiString(data.password);
  return `WIFI:S:${escapedSSID};T:${data.security};P:${escapedPassword};;`;
}

/**
 * Escape special characters in WiFi strings
 */
function escapeWiFiString(str: string): string {
  return str.replace(/([\\;,:"])/g, "\\$1");
}

/**
 * Format vCard contact information
 * Version 3.0 for broad compatibility
 */
export function formatVCard(data: VCardData): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
  ];

  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${data.phone}`);
  }
  if (data.email) {
    lines.push(`EMAIL:${data.email}`);
  }
  if (data.company) {
    lines.push(`ORG:${data.company}`);
  }
  if (data.jobTitle) {
    lines.push(`TITLE:${data.jobTitle}`);
  }
  if (data.website) {
    lines.push(`URL:${data.website}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/**
 * Format WhatsApp chat link
 * Format: https://wa.me/{phone}?text={message}
 */
export function formatWhatsApp(data: WhatsAppData): string {
  const cleanPhone = data.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  let url = `https://wa.me/${cleanPhone}`;

  if (data.message) {
    const encodedMessage = encodeURIComponent(data.message);
    url += `?text=${encodedMessage}`;
  }

  return url;
}

/**
 * Format email mailto link
 * Format: mailto:{email}?subject={subject}&body={body}
 */
export function formatEmail(data: EmailData): string {
  let url = `mailto:${encodeURIComponent(data.email)}`;
  const params: string[] = [];

  if (data.subject) {
    params.push(`subject=${encodeURIComponent(data.subject)}`);
  }
  if (data.body) {
    params.push(`body=${encodeURIComponent(data.body)}`);
  }

  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  return url;
}

/**
 * Format SMS link
 * Format: sms:{phone}?body={message}
 */
export function formatSMS(data: SMSData): string {
  const cleanPhone = data.phone.replace(/[^\d+]/g, "");
  let url = `sms:${cleanPhone}`;

  if (data.message) {
    const encodedMessage = encodeURIComponent(data.message);
    url += `?body=${encodedMessage}`;
  }

  return url;
}

/**
 * Format phone dialer link
 * Format: tel:{phone}
 */
export function formatPhone(data: PhoneData): string {
  const cleanPhone = data.phone.replace(/[^\d+]/g, "");
  return `tel:${cleanPhone}`;
}

/**
 * Format app store link
 * Returns the appropriate URL based on platform selection
 */
export function formatAppStore(data: AppStoreData): string {
  if (data.platform === "both" && data.androidUrl) {
    // For smart links, we'll use a redirect service or return iOS as default
    // In a production app, you might use a service like onelink.to or branch.io
    // For now, we return the iOS URL as the primary
    return data.appUrl;
  }

  return data.appUrl;
}

/**
 * Format Google Maps link
 * Format: https://maps.google.com/?q={address}
 */
export function formatMaps(data: MapsData): string {
  const encodedAddress = encodeURIComponent(data.address);
  let url = `https://maps.google.com/?q=${encodedAddress}`;

  if (data.label) {
    url = `https://maps.google.com/?q=${encodeURIComponent(data.label)}+${encodedAddress}`;
  }

  return url;
}

/**
 * Format calendar event in iCal format
 * Format: BEGIN:VCALENDAR ... END:VCALENDAR
 */
export function formatCalendar(data: CalendarData): string {
  const formatDateTime = (date: string, time: string): string => {
    // Convert YYYY-MM-DD and HH:MM to YYYYMMDDTHHMMSS format
    const dateStr = date.replace(/-/g, "");
    const timeStr = time.replace(/:/g, "") + "00";
    return `${dateStr}T${timeStr}`;
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@theqrspot.com`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The QR Spot//Template Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDateTime(data.startDate, data.startTime)}`,
    `DTEND:${formatDateTime(data.endDate, data.endTime)}`,
    `SUMMARY:${escapeICalString(data.title)}`,
  ];

  if (data.description) {
    lines.push(`DESCRIPTION:${escapeICalString(data.description)}`);
  }
  if (data.location) {
    lines.push(`LOCATION:${escapeICalString(data.location)}`);
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Escape special characters in iCal strings
 */
function escapeICalString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Format payment link based on platform
 */
export function formatPayment(data: PaymentData): string {
  const cleanUsername = data.username.trim();

  switch (data.platform) {
    case "paypal": {
      // PayPal.me format: https://paypal.me/username/amount
      let url = `https://paypal.me/${cleanUsername}`;
      if (data.amount) {
        url += `/${data.amount}`;
      }
      return url;
    }
    case "venmo": {
      // Venmo deep link: venmo://paycharge?txn=pay&recipients=username&amount=X&note=Y
      let url = `https://venmo.com/${cleanUsername}`;
      const params: string[] = [];
      if (data.amount) {
        params.push(`amount=${data.amount}`);
      }
      if (data.note) {
        params.push(`note=${encodeURIComponent(data.note)}`);
      }
      if (params.length > 0) {
        url += "?" + params.join("&");
      }
      return url;
    }
    case "cashapp": {
      // Cash App format: https://cash.app/$cashtag/amount
      const cashtag = cleanUsername.startsWith("$")
        ? cleanUsername
        : `$${cleanUsername}`;
      let url = `https://cash.app/${cashtag}`;
      if (data.amount) {
        url += `/${data.amount}`;
      }
      return url;
    }
    default:
      return "";
  }
}

/**
 * Generic formatter that routes to the correct formatter based on template ID
 */
export function formatTemplateData(
  templateId: string,
  data: Record<string, string>
): string {
  switch (templateId) {
    case "wifi":
      return formatWiFi({
        ssid: data.ssid,
        password: data.password,
        security: data.security as "WPA" | "WEP" | "nopass",
      });
    case "vcard":
      return formatVCard({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        company: data.company,
        jobTitle: data.jobTitle,
        website: data.website,
      });
    case "whatsapp":
      return formatWhatsApp({
        phone: data.phone,
        message: data.message,
      });
    case "email":
      return formatEmail({
        email: data.email,
        subject: data.subject,
        body: data.body,
      });
    case "sms":
      return formatSMS({
        phone: data.phone,
        message: data.message,
      });
    case "phone":
      return formatPhone({
        phone: data.phone,
      });
    case "app-store":
      return formatAppStore({
        platform: data.platform as "ios" | "android" | "both",
        appUrl: data.appUrl,
        androidUrl: data.androidUrl,
      });
    case "maps":
      return formatMaps({
        address: data.address,
        label: data.label,
      });
    case "calendar":
      return formatCalendar({
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        location: data.location,
      });
    case "payment":
      return formatPayment({
        platform: data.platform as "paypal" | "venmo" | "cashapp",
        username: data.username,
        amount: data.amount,
        note: data.note,
      });
    default:
      return "";
  }
}
