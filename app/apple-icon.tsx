import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = {
  width: 180,
  height: 180
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 20%, #2b1c1a 0%, #121926 45%, #0b1018 100%)"
        }}
      >
        <div
          style={{
            display: "flex",
            height: 128,
            width: 128,
            borderRadius: 34,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(160deg, #ff5a1f 0%, #ff3c00 58%, #cf2d00 100%)",
            boxShadow: "0 14px 36px rgba(255,60,0,0.34)"
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -3,
              fontFamily: "Arial"
            }}
          >
            LL
          </div>
        </div>
      </div>
    ),
    size
  );
}
