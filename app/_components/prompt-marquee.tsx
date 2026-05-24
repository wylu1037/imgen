import { cn } from "@/lib/utils";

type PromptMarqueeProps = {
  items: readonly string[];
  /** seconds per loop */
  speed?: number;
  className?: string;
};

/**
 * Horizontal auto-scroll strip of prompts. Pauses on hover. Edges are masked
 * so the loop seam is invisible. Pure CSS — reduce-motion is honoured by the
 * media query in globals.css.
 */
export function PromptMarquee({
  items,
  speed = 48,
  className,
}: PromptMarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        "[-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      <div
        className="animate-marquee-slide flex w-max gap-3 group-hover:paused"
        style={{ ["--marquee-duration" as string]: `${speed}s` }}
      >
        {doubled.map((prompt, i) => {
          const localIndex = (i % items.length) + 1;
          return (
            <article
              key={`${i}-${prompt}`}
              className="flex w-88 shrink-0 flex-col gap-1.5 rounded-xl border border-hairline-soft bg-card/85 px-4 py-3 shadow-subtle backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_18px_40px_-22px_rgba(15,15,15,0.18)]"
            >
              <span className="font-mono text-[10px] tracking-[0.18em] text-stone uppercase">
                prompt · {String(localIndex).padStart(2, "0")}
              </span>
              <p className="font-serif text-[13px] leading-relaxed text-charcoal italic">
                {prompt}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
