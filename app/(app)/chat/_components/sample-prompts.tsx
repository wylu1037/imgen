"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { samplePrompts } from "@/lib/chat/constants";

type SamplePromptsProps = {
  onPick: (prompt: string) => void;
};

const STACK_COUNT = 3;
const CARD_WIDTH = 220;
const SPREAD_GAP = 12;

const cardVariants: Variants = {
  stacked: (i: number) => ({
    x: (i - 1) * 4,
    y: i * 6,
    rotate: (i - 1) * 3,
    scale: 1 - i * 0.025,
    zIndex: STACK_COUNT - i,
  }),
  spread: (i: number) => ({
    x: (i - 1) * (CARD_WIDTH + SPREAD_GAP),
    y: 0,
    rotate: (i - 1) * 1.5,
    scale: 1,
    zIndex: STACK_COUNT - i,
  }),
};

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 240,
  damping: 24,
  mass: 0.6,
};

export function SamplePrompts({ onPick }: SamplePromptsProps) {
  const [isHover, setIsHover] = React.useState(false);
  const prompts = React.useMemo(() => samplePrompts.slice(0, STACK_COUNT), []);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-center gap-2 text-[12px] tracking-[0.16em] text-stone">
        <Sparkles className="h-3.5 w-3.5" />
        Try a sample prompt
      </div>

      <div
        className="relative mx-auto hidden h-47.5 w-full sm:block"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            type="button"
            custom={i}
            initial="stacked"
            animate={isHover ? "spread" : "stacked"}
            variants={cardVariants}
            transition={SPRING_TRANSITION}
            whileHover={isHover ? { y: -6, scale: 1.02 } : undefined}
            onClick={() => onPick(prompt)}
            style={{
              left: "50%",
              marginLeft: -(CARD_WIDTH / 2),
              width: CARD_WIDTH,
              transformOrigin: "50% 50%",
            }}
            className={cn(
              "group/card absolute top-0 cursor-pointer rounded-xl border border-hairline-soft bg-surface-soft",
              "px-4 py-4 text-left",
              "font-serif text-[14.5px] leading-[1.55] tracking-[-0.005em] text-charcoal italic",
              "shadow-[0_1px_2px_rgba(55,53,47,0.04),0_4px_16px_rgba(55,53,47,0.05)]",
              "transition-[box-shadow,border-color] duration-300",
              "hover:border-hairline-soft/80 hover:shadow-[0_2px_4px_rgba(55,53,47,0.06),0_18px_36px_rgba(55,53,47,0.09)]",
              "focus-visible:ring-offset-canvas focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            <span className="mb-2 block font-sans text-[10px] tracking-[0.18em] text-stone/80 not-italic">
              Prompt · {String(i + 1).padStart(2, "0")}
            </span>
            <span className="block">{prompt}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {prompts.map((prompt, i) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className={cn(
              "rounded-xl border border-hairline-soft bg-surface-soft px-4 py-4 text-left",
              "font-serif text-[14px] leading-[1.55] tracking-[-0.005em] text-charcoal italic",
              "shadow-[0_1px_2px_rgba(55,53,47,0.04)]",
              "active:scale-[0.99]",
            )}
          >
            <span className="mb-1.5 block font-sans text-[10px] tracking-[0.18em] text-stone/80 uppercase not-italic">
              prompt · {String(i + 1).padStart(2, "0")}
            </span>
            <span className="block">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
