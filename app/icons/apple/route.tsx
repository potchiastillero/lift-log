import { ImageResponse } from "next/og";
import { LiftLogIcon } from "@/app/icons/shared";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <LiftLogIcon
      canvasSize={180}
      badgeSize={128}
      badgeRadius={34}
      plateWidth={12}
      plateHeight={30}
      plateRadius={5}
      barWidth={44}
      barHeight={7}
      innerGap={8}
      glowBlur={36}
      shadowY={14}
    />,
    {
      width: 180,
      height: 180
    }
  );
}
