import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FFD54F",
          borderRadius: 56,
          position: "relative",
          display: "flex",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <path
            d="M 152 70 A 60 60 0 1 0 152 130"
            fill="none"
            stroke="white"
            strokeWidth={32}
            strokeLinecap="round"
          />
          <circle cx={158} cy={82} r={10} fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
