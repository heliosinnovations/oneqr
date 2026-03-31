import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fffef9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#ff5500",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: "84px",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#1a1a1a" }}>The QR </span>
          <span style={{ color: "#ff5500" }}>Spot</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "42px",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          Free QR Code Generator
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "28px",
            color: "#666",
            marginBottom: "40px",
          }}
        >
          Create • Download • Print • No signup required
        </div>

        {/* QR Code visual */}
        <div
          style={{
            display: "flex",
            width: "140px",
            height: "140px",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "120px",
              height: "120px",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "8px",
              gap: "4px",
            }}
          >
            {/* QR pattern squares */}
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#1a1a1a",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "transparent",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#1a1a1a",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "transparent",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#1a1a1a",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "transparent",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#1a1a1a",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "transparent",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#ff5500",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "24px",
            color: "#999",
          }}
        >
          theqrspot.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
