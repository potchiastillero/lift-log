import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
            height: 360,
            width: 360,
            borderRadius: 96,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(160deg, #ff5a1f 0%, #ff3c00 58%, #cf2d00 100%)",
            boxShadow: "0 30px 100px rgba(255,60,0,0.34)"
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 180,
              fontWeight: 800,
              letterSpacing: -10,
              fontFamily: "Arial"
            }}
          >
            LL
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512
    }
  );
}
