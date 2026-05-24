"use client";

import * as React from "react";
import { animate, useInView, useMotionValue, useTransform } from "motion/react";

type LiveCounterProps = {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
};

/**
 * Number that flips up to its target when it scrolls into view. Antimetal uses
 * this for its "40%" stat — the rolling odometer pulls the eye into the section.
 */
export function LiveCounter({
  to,
  from = 0,
  duration = 1.6,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: LiveCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const mv = useMotionValue(from);
  const formatted = useTransform(mv, (latest) =>
    latest.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );
  const [display, setDisplay] = React.useState<string>(() =>
    from.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  React.useEffect(() => {
    const unsubscribe = formatted.on("change", setDisplay);
    return unsubscribe;
  }, [formatted]);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, mv, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{display}</span>
      {suffix}
    </span>
  );
}
