import { ImageResponse } from "next/og";
import { LiftLogIcon } from "@/app/icons/shared";

export const contentType = "image/png";
export const sizes = {
  default: "512x512"
};

export default function Icon() {
  return new ImageResponse(
    <LiftLogIcon
      canvasSize={512}
      badgeSize={360}
      badgeRadius={96}
      plateWidth={34}
      plateHeight={88}
      plateRadius={14}
      barWidth={126}
      barHeight={20}
      innerGap={26}
      glowBlur={100}
      shadowY={30}
    />,
    {
      width: 512,
      height: 512
    }
  );
}
