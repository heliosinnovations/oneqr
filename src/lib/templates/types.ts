export type TemplateId =
  | "wifi"
  | "vcard"
  | "whatsapp"
  | "email"
  | "sms"
  | "phone"
  | "app-store"
  | "maps"
  | "calendar"
  | "payment";

export type TemplateCategory = "popular" | "communication" | "business";

export interface TemplateField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "textarea"
    | "select"
    | "password"
    | "url"
    | "date"
    | "time";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  iconClass: string;
  category: TemplateCategory;
  fields: TemplateField[];
  sections?: { title: string; fields: string[] }[];
  exampleData: Record<string, string>;
  badge?: string;
}

// Template definitions
export const templates: Template[] = [
  // Popular
  {
    id: "wifi",
    name: "WiFi Network",
    description: "Share WiFi credentials",
    iconClass: "icon-wifi",
    category: "popular",
    badge: "Hot",
    sections: [
      { title: "Network Details", fields: ["ssid", "security", "password"] },
    ],
    fields: [
      {
        name: "ssid",
        label: "Network Name (SSID)",
        type: "text",
        placeholder: "e.g., MyHomeWiFi",
        required: true,
        hint: "Enter the exact name of your WiFi network (case-sensitive)",
      },
      {
        name: "security",
        label: "Security Type",
        type: "select",
        options: [
          { value: "WPA", label: "WPA/WPA2" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "None" },
        ],
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter WiFi password",
        required: true,
        hint: "Your password is encoded in the QR code, never stored on our servers",
      },
    ],
    exampleData: {
      ssid: "Guest WiFi",
      security: "WPA",
      password: "welcome123",
    },
  },
  {
    id: "vcard",
    name: "vCard Contact",
    description: "Digital business card",
    iconClass: "icon-vcard",
    category: "popular",
    sections: [
      { title: "Personal Information", fields: ["firstName", "lastName"] },
      { title: "Contact Details", fields: ["phone", "email"] },
      {
        title: "Professional Info",
        fields: ["company", "jobTitle", "website"],
      },
    ],
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "John",
        required: true,
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        required: true,
      },
      {
        name: "phone",
        label: "Phone",
        type: "tel",
        placeholder: "+1 (555) 000-0000",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "john@company.com",
        required: true,
      },
      {
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Acme Inc.",
        required: false,
      },
      {
        name: "jobTitle",
        label: "Job Title",
        type: "text",
        placeholder: "CEO",
        required: false,
      },
      {
        name: "website",
        label: "Website",
        type: "url",
        placeholder: "https://company.com",
        required: false,
      },
    ],
    exampleData: {
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah@acmecorp.com",
      company: "Acme Corporation",
      jobTitle: "Marketing Director",
      website: "https://acmecorp.com",
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp Chat",
    description: "Start a conversation",
    iconClass: "icon-whatsapp",
    category: "popular",
    sections: [{ title: "WhatsApp Details", fields: ["phone", "message"] }],
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 555 123 4567",
        required: true,
        hint: "Include country code (e.g., +1 for USA)",
      },
      {
        name: "message",
        label: "Pre-filled Message",
        type: "textarea",
        placeholder: "Hi! I scanned your QR code...",
        required: false,
        hint: "Optional message that appears when they open the chat",
      },
    ],
    exampleData: {
      phone: "+1 555 123 4567",
      message: "Hi! I'm interested in your services.",
    },
  },
  // Communication
  {
    id: "email",
    name: "Email Composer",
    description: "Pre-filled email",
    iconClass: "icon-email",
    category: "communication",
    sections: [
      { title: "Email Details", fields: ["email", "subject", "body"] },
    ],
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "contact@company.com",
        required: true,
      },
      {
        name: "subject",
        label: "Subject Line",
        type: "text",
        placeholder: "Inquiry from QR code",
        required: false,
      },
      {
        name: "body",
        label: "Email Body",
        type: "textarea",
        placeholder: "Hello, I scanned your QR code and...",
        required: false,
      },
    ],
    exampleData: {
      email: "contact@company.com",
      subject: "Inquiry from QR Code",
      body: "Hello,\n\nI scanned your QR code and would like to learn more about your services.",
    },
  },
  {
    id: "sms",
    name: "SMS Sender",
    description: "Pre-filled text message",
    iconClass: "icon-sms",
    category: "communication",
    sections: [{ title: "SMS Details", fields: ["phone", "message"] }],
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 555 123 4567",
        required: true,
        hint: "Include country code for international numbers",
      },
      {
        name: "message",
        label: "Pre-filled Message",
        type: "textarea",
        placeholder: "Hi! I scanned your QR code...",
        required: false,
      },
    ],
    exampleData: {
      phone: "+1 555 123 4567",
      message: "Hi! I scanned your QR code.",
    },
  },
  {
    id: "phone",
    name: "Phone Dialer",
    description: "Call now button",
    iconClass: "icon-phone",
    category: "communication",
    sections: [{ title: "Phone Details", fields: ["phone"] }],
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 555 123 4567",
        required: true,
        hint: "Include country code for international numbers",
      },
    ],
    exampleData: {
      phone: "+1 555 123 4567",
    },
  },
  // Business
  {
    id: "app-store",
    name: "App Store Link",
    description: "iOS & Android apps",
    iconClass: "icon-appstore",
    category: "business",
    sections: [{ title: "App Store Links", fields: ["platform", "appUrl"] }],
    fields: [
      {
        name: "platform",
        label: "Platform",
        type: "select",
        options: [
          { value: "ios", label: "iOS (App Store)" },
          { value: "android", label: "Android (Play Store)" },
          { value: "both", label: "Smart Link (Detects Device)" },
        ],
        required: true,
      },
      {
        name: "appUrl",
        label: "App Store URL",
        type: "url",
        placeholder: "https://apps.apple.com/app/id123456789",
        required: true,
        hint: "Paste the full URL from the App Store or Play Store",
      },
      {
        name: "androidUrl",
        label: "Play Store URL (for Smart Link)",
        type: "url",
        placeholder:
          "https://play.google.com/store/apps/details?id=com.example",
        required: false,
        hint: "Required only when using Smart Link option",
      },
    ],
    exampleData: {
      platform: "ios",
      appUrl: "https://apps.apple.com/app/id123456789",
      androidUrl: "",
    },
  },
  {
    id: "maps",
    name: "Google Maps",
    description: "Location with directions",
    iconClass: "icon-maps",
    category: "business",
    sections: [{ title: "Location Details", fields: ["address", "label"] }],
    fields: [
      {
        name: "address",
        label: "Address or Coordinates",
        type: "text",
        placeholder: "1600 Amphitheatre Parkway, Mountain View, CA",
        required: true,
        hint: "Enter a street address or lat,long coordinates",
      },
      {
        name: "label",
        label: "Location Label",
        type: "text",
        placeholder: "Our Office",
        required: false,
        hint: "Optional name to display on the map",
      },
    ],
    exampleData: {
      address: "1600 Amphitheatre Parkway, Mountain View, CA",
      label: "Google HQ",
    },
  },
  {
    id: "calendar",
    name: "Calendar Event",
    description: "Save the date",
    iconClass: "icon-calendar",
    category: "business",
    sections: [
      { title: "Event Details", fields: ["title", "description"] },
      {
        title: "Date & Time",
        fields: ["startDate", "startTime", "endDate", "endTime"],
      },
      { title: "Location", fields: ["location"] },
    ],
    fields: [
      {
        name: "title",
        label: "Event Title",
        type: "text",
        placeholder: "Team Meeting",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Weekly sync to discuss project updates...",
        required: false,
      },
      {
        name: "startDate",
        label: "Start Date",
        type: "date",
        required: true,
      },
      {
        name: "startTime",
        label: "Start Time",
        type: "time",
        required: true,
      },
      {
        name: "endDate",
        label: "End Date",
        type: "date",
        required: true,
      },
      {
        name: "endTime",
        label: "End Time",
        type: "time",
        required: true,
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Conference Room A / Zoom link",
        required: false,
      },
    ],
    exampleData: {
      title: "Product Launch",
      description: "Join us for our annual product launch event.",
      startDate: "2026-05-15",
      startTime: "14:00",
      endDate: "2026-05-15",
      endTime: "16:00",
      location: "Main Auditorium",
    },
  },
  {
    id: "payment",
    name: "Payment Link",
    description: "PayPal, Venmo, Cash App",
    iconClass: "icon-payment",
    category: "business",
    sections: [
      {
        title: "Payment Details",
        fields: ["platform", "username", "amount", "note"],
      },
    ],
    fields: [
      {
        name: "platform",
        label: "Payment Platform",
        type: "select",
        options: [
          { value: "paypal", label: "PayPal" },
          { value: "venmo", label: "Venmo" },
          { value: "cashapp", label: "Cash App" },
        ],
        required: true,
      },
      {
        name: "username",
        label: "Username / Email",
        type: "text",
        placeholder: "your-username",
        required: true,
        hint: "Your PayPal email, Venmo username, or Cash App $cashtag",
      },
      {
        name: "amount",
        label: "Amount (optional)",
        type: "text",
        placeholder: "10.00",
        required: false,
        hint: "Pre-fill a specific amount (numbers only)",
      },
      {
        name: "note",
        label: "Payment Note",
        type: "text",
        placeholder: "Coffee fund",
        required: false,
      },
    ],
    exampleData: {
      platform: "paypal",
      username: "john@example.com",
      amount: "5.00",
      note: "Coffee",
    },
  },
];

export function getTemplateById(id: TemplateId): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter((t) => t.category === category);
}

export const categories: { id: TemplateCategory; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "communication", label: "Communication" },
  { id: "business", label: "Business" },
];
