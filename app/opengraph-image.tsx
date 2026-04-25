import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ciro — Experience cities through AI-powered stories";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 45%, #06070d 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "linear-gradient(135deg, #f59e0b, #f43f5e, #7c3aed)",
            }}
          />
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>Ciro</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Experience cities through{" "}
            <span
              style={{
                background:
                  "linear-gradient(120deg, #f59e0b 0%, #f43f5e 45%, #a78bfa 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              AI-powered stories
            </span>
            .
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
            <span>Live in Rome</span>
            <span>·</span>
            <span>Milan, Paris, Barcelona soon</span>
            <span>·</span>
            <span>By Erfan Soleymanzadeh</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
