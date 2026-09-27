import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ciro · Every street has a story";
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
          background: "#faf7f0",
          color: "#0a0d16",
          fontFamily: "Georgia, serif",
          borderBottom: "16px solid #d99b1e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              background: "#d99b1e",
              display: "flex",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 200 200">
              <path
                d="M 152 70 A 60 60 0 1 0 152 130"
                fill="none"
                stroke="#faf7f0"
                strokeWidth={32}
                strokeLinecap="round"
              />
              <circle cx={158} cy={82} r={10} fill="#faf7f0" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: 6 }}>CIRO</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.08,
              fontWeight: 500,
              maxWidth: 980,
            }}
          >
            Every place has a story.
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 22,
              color: "rgba(10,13,22,0.6)",
            }}
          >
            <span>Live in Rome</span>
            <span>·</span>
            <span>Short stories tied to real places</span>
            <span>·</span>
            <span>By Erfan Soleymanzadeh</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
