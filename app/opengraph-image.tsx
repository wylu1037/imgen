import { ImageResponse } from "next/og";

export const alt = "Imgen — AI Image Workspace";
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf9",
          padding: 80,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 720,
            height: 720,
            borderRadius: 360,
            backgroundColor: "#7b3ff2",
            opacity: 0.08,
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        <div
          style={{
            width: 144,
            height: 144,
            borderRadius: 72,
            backgroundColor: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
            position: "relative",
            boxShadow: "0 12px 32px rgba(26,26,26,0.18)",
          }}
        >
          <svg width="144" height="144" viewBox="0 0 180 180">
            <path
              d="M38 136 L38 52 L56 52 L90 100 L124 52 L142 52 L142 136 L124 136 L124 80 L96 124 L84 124 L56 80 L56 136 Z"
              fill="white"
            />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 112,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "#37352f",
            marginBottom: 28,
            position: "relative",
          }}
        >
          <span>Imgen</span>
          <span style={{ color: "#7b3ff2" }}>.</span>
        </div>

        <div
          style={{
            fontSize: 32,
            fontStyle: "italic",
            color: "#8e8b82",
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.4,
            position: "relative",
            display: "flex",
          }}
        >
          Generate images through a configurable OpenAI image API workspace
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
