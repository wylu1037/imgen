"use client";

import * as React from "react";
import { motion, type Variants, type Transition } from "motion/react";

import { SamplePrompts } from "./sample-prompts";

const SPRING_REVEAL: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 22,
  mass: 0.7,
};

const stageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: SPRING_REVEAL },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRING_REVEAL,
  },
};

const headlineParts: Array<{
  key: string;
  text: string;
  className: string;
}> = [
  {
    key: "what",
    text: "What would you",
    className: "font-sans font-semibold tracking-tight text-ink",
  },
  {
    key: "like",
    text: "like to",
    className: "font-sans font-semibold tracking-tight text-ink",
  },
  {
    key: "generate",
    text: "generate",
    className:
      "font-serif italic font-medium text-primary tracking-[-0.01em]",
  },
  {
    key: "qmark",
    text: "?",
    className: "font-sans font-semibold tracking-tight text-ink",
  },
];

type ChatEmptyStateProps = {
  onPickSample: (prompt: string) => void;
};

export function ChatEmptyState({ onPickSample }: ChatEmptyStateProps) {
  return (
    <motion.div
      className="relative flex h-full items-center justify-center overflow-hidden px-4 py-12"
      variants={stageVariants}
      initial="hidden"
      animate="show"
    >
      <AmbientOrb />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          variants={rowVariants}
          className="mb-5 flex items-center justify-center gap-2"
        >
          <BreathingPip />
          <span className="font-mono text-[10.5px] tracking-[0.22em] text-stone uppercase">
            new canvas
          </span>
        </motion.div>

        <h1 className="mb-4 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 text-center text-[32px] leading-[1.05] md:text-[40px]">
          {headlineParts.map((part) => (
            <motion.span
              key={part.key}
              variants={wordVariants}
              className={part.className}
            >
              {part.text}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={rowVariants}
          className="mx-auto mb-9 max-w-[44ch] text-center font-serif text-[15px] leading-relaxed text-steel italic"
        >
          Describe a scene, mood, or subject. Each prompt generates an
          independent image.
        </motion.p>

        <motion.div variants={rowVariants}>
          <SamplePrompts onPick={onPickSample} />
        </motion.div>
      </div>
    </motion.div>
  );
}

const AmbientOrb = React.memo(function AmbientOrb() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-[38%] left-1/2 z-0 h-90 w-90 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-3xl"
      animate={{
        opacity: [0.55, 1, 0.55],
        scale: [1, 1.12, 1],
      }}
      transition={{
        duration: 6.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
});

const BreathingPip = React.memo(function BreathingPip() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-primary/35"
        animate={{ scale: [1, 2.6, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary" />
    </span>
  );
});
