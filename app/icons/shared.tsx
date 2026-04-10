type LiftLogIconProps = {
  canvasSize: number;
  badgeSize: number;
  badgeRadius: number;
  plateWidth: number;
  plateHeight: number;
  plateRadius: number;
  barWidth: number;
  barHeight: number;
  innerGap: number;
  glowBlur: number;
  shadowY: number;
};

export function LiftLogIcon({
  canvasSize,
  badgeSize,
  badgeRadius,
  plateWidth,
  plateHeight,
  plateRadius,
  barWidth,
  barHeight,
  innerGap,
  glowBlur,
  shadowY
}: LiftLogIconProps) {
  const insetBadge = Math.round(badgeSize * 0.76);
  const insetRadius = Math.round(badgeRadius * 0.76);
  const accentRing = Math.max(2, Math.round(badgeSize * 0.035));

  const plateStyles = (heightScale: number, opacity: number) => ({
    width: plateWidth,
    height: Math.round(plateHeight * heightScale),
    borderRadius: plateRadius,
    background: "#f8fafc",
    opacity
  });

  return (
    <div
      style={{
        display: "flex",
        height: canvasSize,
        width: canvasSize,
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 24% 18%, #2f1d1a 0%, #151b27 44%, #0b1018 100%)"
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          height: badgeSize,
          width: badgeSize,
          borderRadius: badgeRadius,
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #ff774d 0%, #ff4d14 42%, #ff3c00 70%, #d93300 100%)",
          boxShadow: `0 ${shadowY}px ${glowBlur}px rgba(255,60,0,0.34)`
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: accentRing,
            borderRadius: insetRadius,
            background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0))"
          }}
        />
        <div
          style={{
            position: "absolute",
            height: insetBadge,
            width: insetBadge,
            borderRadius: insetRadius,
            background:
              "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.05), rgba(255,255,255,0) 34%), linear-gradient(180deg, #151b29 0%, #0e1320 100%)",
            border: "1px solid rgba(255,255,255,0.09)"
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: innerGap
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: Math.max(2, Math.round(innerGap * 0.32)) }}>
            <div style={plateStyles(1, 1)} />
            <div style={plateStyles(0.7, 0.92)} />
            <div style={plateStyles(0.45, 0.85)} />
          </div>

          <div
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: 999,
              background: "linear-gradient(90deg, #f8fafc 0%, #dfe7f1 100%)"
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: Math.max(2, Math.round(innerGap * 0.32)) }}>
            <div style={plateStyles(0.45, 0.85)} />
            <div style={plateStyles(0.7, 0.92)} />
            <div style={plateStyles(1, 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
