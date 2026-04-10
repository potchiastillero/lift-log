import { ImageResponse } from "next/og";
import { LiftLogIcon } from "@/app/icons/shared";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <LiftLogIcon
      canvasSize={192}
      badgeSize={136}
      badgeRadius={36}
      plateWidth={13}
      plateHeight={32}
      plateRadius={5}
      barWidth={48}
      barHeight={8}
      innerGap={10}
      glowBlur={36}
      shadowY={14}
    />,
    {
      width: 192,
      height: 192
    }
  );
}
