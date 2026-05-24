import { cn } from "@/lib/utils";

type Tone = "light" | "navy" | "deep";

type AuroraBackdropProps = {
  /**
   * light — primary glow on light background (hero)
   * navy  — pale glow on the brand-navy CTA panel
   * deep  — saturated wash for the final CTA, antimetal-style halo
   */
  tone?: Tone;
  /** "top" anchors the glow to the top edge; "bottom" mirrors it. */
  origin?: "top" | "bottom";
  className?: string;
};

const palettes: Record<
  Tone,
  {
    glowA: string;
    glowB: string;
    glowC: string;
    gridColor: string;
    scan: string;
  }
> = {
  light: {
    glowA: "rgba(86,69,212,0.22)",
    glowB: "rgba(0,117,222,0.18)",
    glowC: "rgba(123,63,242,0.14)",
    gridColor: "rgba(15,15,15,0.045)",
    scan: "rgba(86,69,212,0.32)",
  },
  navy: {
    glowA: "rgba(140,150,255,0.38)",
    glowB: "rgba(80,130,255,0.30)",
    glowC: "rgba(255,180,255,0.16)",
    gridColor: "rgba(255,255,255,0.06)",
    scan: "rgba(255,255,255,0.45)",
  },
  deep: {
    glowA: "rgba(124,109,255,0.28)",
    glowB: "rgba(255,120,210,0.14)",
    glowC: "rgba(60,90,220,0.22)",
    gridColor: "rgba(255,255,255,0.06)",
    scan: "rgba(255,255,255,0.55)",
  },
};

/**
 * Antimetal-style top aurora — a wide ellipsoid glow that hangs off the top
 * edge, combined with a faint grid mask and a slow scan line. Composes inside
 * any relatively positioned section.
 */
export function AuroraBackdrop({
  tone = "light",
  origin = "top",
  className,
}: AuroraBackdropProps) {
  const p = palettes[tone];
  const isBottom = origin === "bottom";

  const gridMask = isBottom
    ? "linear-gradient(to top, black 25%, transparent 92%)"
    : "linear-gradient(to bottom, black 28%, transparent 92%)";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="animate-aurora-pan absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 52% 48% at 50% ${isBottom ? "78%" : "22%"}, ${p.glowA}, transparent 62%),
            radial-gradient(ellipse 70% 36% at 22% ${isBottom ? "82%" : "18%"}, ${p.glowB}, transparent 64%),
            radial-gradient(ellipse 60% 34% at 78% ${isBottom ? "80%" : "20%"}, ${p.glowC}, transparent 66%)
          `,
          backgroundSize: "140% 140%",
          backgroundPosition: "50% 50%",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${p.gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${p.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />

      <div
        className="animate-scan-sweep absolute inset-x-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${p.scan}, transparent)`,
        }}
      />
    </div>
  );
}
