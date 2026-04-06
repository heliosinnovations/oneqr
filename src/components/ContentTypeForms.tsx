"use client";

import { useState, useEffect, useCallback } from "react";

// WiFi Form Data Interface
export interface WiFiFormData {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

// Contact/vCard Form Data Interface
export interface ContactFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  title: string;
  url: string;
  address: string;
}

// Initial form data
export const initialWiFiData: WiFiFormData = {
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false,
};

export const initialContactData: ContactFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  organization: "",
  title: "",
  url: "",
  address: "",
};

// Generate WiFi QR string from form data
export const generateWiFiString = (data: WiFiFormData): string => {
  if (!data.ssid.trim()) return "";

  // Escape special characters in SSID and password
  const escapeWiFi = (str: string): string => {
    return str.replace(/[\\;,":\\]/g, (char) => `\\${char}`);
  };

  const ssid = escapeWiFi(data.ssid);
  const password = data.security !== "nopass" ? escapeWiFi(data.password) : "";
  const hidden = data.hidden ? "H:true;" : "";

  if (data.security === "nopass") {
    return `WIFI:T:nopass;S:${ssid};${hidden};`;
  }

  return `WIFI:T:${data.security};S:${ssid};P:${password};${hidden};`;
};

// Generate vCard string from form data
export const generateVCardString = (data: ContactFormData): string => {
  const fullName = `${data.firstName} ${data.lastName}`.trim() || "Contact";

  let vcard = "BEGIN:VCARD\n";
  vcard += "VERSION:3.0\n";
  vcard += `FN:${fullName}\n`;

  if (data.firstName || data.lastName) {
    vcard += `N:${data.lastName};${data.firstName};;;\n`;
  }

  if (data.phone) {
    vcard += `TEL;TYPE=CELL:${data.phone}\n`;
  }

  if (data.email) {
    vcard += `EMAIL:${data.email}\n`;
  }

  if (data.organization) {
    vcard += `ORG:${data.organization}\n`;
  }

  if (data.title) {
    vcard += `TITLE:${data.title}\n`;
  }

  if (data.url) {
    let urlValue = data.url.trim();
    if (urlValue && !urlValue.startsWith("http")) {
      urlValue = `https://${urlValue}`;
    }
    vcard += `URL:${urlValue}\n`;
  }

  if (data.address) {
    vcard += `ADR;TYPE=HOME:;;${data.address};;;;\n`;
  }

  vcard += "END:VCARD";
  return vcard;
};

// Common input styles
const inputClassName =
  "w-full rounded-md border border-[var(--pro-border)] px-3 py-2.5 text-sm outline-none transition-all focus:border-[var(--pro-accent)] focus:shadow-[0_0_0_3px_var(--pro-accent-light)] placeholder:text-[var(--pro-muted)]";

const labelClassName = "mb-1.5 block text-xs font-medium text-[var(--pro-fg)]";

const optionalLabelClassName =
  "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--pro-fg)]";

interface WiFiFormProps {
  data: WiFiFormData;
  onChange: (data: WiFiFormData) => void;
}

export function WiFiForm({ data, onChange }: WiFiFormProps) {
  const handleChange = useCallback(
    (field: keyof WiFiFormData, value: string | boolean) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--pro-border)] pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pro-accent-light)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-[var(--pro-accent)]"
          >
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--pro-fg)]">
            WiFi Network
          </h3>
          <p className="text-xs text-[var(--pro-muted)]">
            Create a QR code for easy WiFi connection
          </p>
        </div>
      </div>

      {/* Network Name (SSID) */}
      <div>
        <label className={labelClassName}>
          Network Name (SSID) <span className="text-[var(--pro-error)]">*</span>
        </label>
        <input
          type="text"
          value={data.ssid}
          onChange={(e) => handleChange("ssid", e.target.value)}
          placeholder="e.g., MyHomeWiFi"
          className={inputClassName}
          autoComplete="off"
        />
        <p className="mt-1 text-[10px] text-[var(--pro-muted)]">
          Enter the exact name of your WiFi network
        </p>
      </div>

      {/* Security Type */}
      <div>
        <label className={labelClassName}>Security Type</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "WPA", label: "WPA/WPA2", desc: "Most common" },
            { value: "WEP", label: "WEP", desc: "Legacy" },
            { value: "nopass", label: "None", desc: "Open network" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleChange(
                  "security",
                  option.value as WiFiFormData["security"]
                )
              }
              className={`rounded-md border p-2 text-center transition-all ${
                data.security === option.value
                  ? "border-[var(--pro-accent)] bg-[var(--pro-accent-light)] text-[var(--pro-accent)]"
                  : "border-[var(--pro-border)] hover:border-[var(--pro-border-dark)] hover:bg-[var(--pro-surface-hover)]"
              }`}
            >
              <span className="block text-xs font-medium">{option.label}</span>
              <span className="block text-[10px] text-[var(--pro-muted)]">
                {option.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Password - only show if security is not 'nopass' */}
      {data.security !== "nopass" && (
        <div>
          <label className={labelClassName}>
            Password <span className="text-[var(--pro-error)]">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              value={data.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter WiFi password"
              className={inputClassName}
              autoComplete="new-password"
            />
          </div>
          <p className="mt-1 text-[10px] text-[var(--pro-muted)]">
            The password for your WiFi network
          </p>
        </div>
      )}

      {/* Hidden Network Toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--pro-border)] bg-[var(--pro-surface)] p-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={data.hidden}
            onChange={(e) => handleChange("hidden", e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--pro-accent)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--pro-accent-light)]"></div>
        </label>
        <div>
          <span className="text-xs font-medium text-[var(--pro-fg)]">
            Hidden Network
          </span>
          <p className="text-[10px] text-[var(--pro-muted)]">
            Enable if your network doesn&apos;t broadcast its name
          </p>
        </div>
      </div>

      {/* Status indicator */}
      {data.ssid && (data.security === "nopass" || data.password) && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-green-600"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-xs text-green-700">
            Ready to generate WiFi QR code
          </span>
        </div>
      )}
    </div>
  );
}

interface ContactFormProps {
  data: ContactFormData;
  onChange: (data: ContactFormData) => void;
}

export function ContactForm({ data, onChange }: ContactFormProps) {
  const handleChange = useCallback(
    (field: keyof ContactFormData, value: string) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange]
  );

  const hasRequiredField =
    data.firstName || data.lastName || data.phone || data.email;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--pro-border)] pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pro-accent-light)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-[var(--pro-accent)]"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--pro-fg)]">
            Contact Card
          </h3>
          <p className="text-xs text-[var(--pro-muted)]">
            Create a vCard QR code to share contact info
          </p>
        </div>
      </div>

      {/* Name Section */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClassName}>First Name</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="John"
            className={inputClassName}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={labelClassName}>Last Name</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Doe"
            className={inputClassName}
            autoComplete="family-name"
          />
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <label className={labelClassName}>Phone Number</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+1 (555) 123-4567"
          className={inputClassName}
          autoComplete="tel"
        />
      </div>

      <div>
        <label className={labelClassName}>Email Address</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="john@example.com"
          className={inputClassName}
          autoComplete="email"
        />
      </div>

      {/* Professional Section */}
      <div className="border-t border-[var(--pro-border)] pt-4">
        <p className="mb-3 text-xs font-medium text-[var(--pro-muted)]">
          Professional Info <span className="font-normal">(optional)</span>
        </p>
        <div className="space-y-3">
          <div>
            <label className={optionalLabelClassName}>
              Organization
              <span className="text-[10px] font-normal text-[var(--pro-muted)]">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={data.organization}
              onChange={(e) => handleChange("organization", e.target.value)}
              placeholder="Company name"
              className={inputClassName}
              autoComplete="organization"
            />
          </div>

          <div>
            <label className={optionalLabelClassName}>
              Job Title
              <span className="text-[10px] font-normal text-[var(--pro-muted)]">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Software Engineer"
              className={inputClassName}
              autoComplete="organization-title"
            />
          </div>
        </div>
      </div>

      {/* Additional Section */}
      <div className="border-t border-[var(--pro-border)] pt-4">
        <p className="mb-3 text-xs font-medium text-[var(--pro-muted)]">
          Additional Info <span className="font-normal">(optional)</span>
        </p>
        <div className="space-y-3">
          <div>
            <label className={optionalLabelClassName}>
              Website
              <span className="text-[10px] font-normal text-[var(--pro-muted)]">
                (optional)
              </span>
            </label>
            <input
              type="url"
              value={data.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://example.com"
              className={inputClassName}
              autoComplete="url"
            />
          </div>

          <div>
            <label className={optionalLabelClassName}>
              Address
              <span className="text-[10px] font-normal text-[var(--pro-muted)]">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main St, City, State"
              className={inputClassName}
              autoComplete="street-address"
            />
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {hasRequiredField && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-green-600"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-xs text-green-700">
            Ready to generate contact QR code
          </span>
        </div>
      )}

      {/* Help text */}
      {!hasRequiredField && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-[var(--pro-accent-light)] p-3">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--pro-accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-[var(--pro-accent)]">
            Add at least a name, phone number, or email to create a contact QR
            code. When scanned, this will allow others to save your contact
            directly to their phone.
          </p>
        </div>
      )}
    </div>
  );
}
