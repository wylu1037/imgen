"use client";

import * as React from "react";
import { ArrowUp, Dices } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type Transition,
} from "motion/react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  pickRandomPrompt,
  qualityOptions,
  sizeOptions,
  type OptionItem,
} from "@/lib/chat/constants";

import { ParamChip } from "./param-chip";
import { useAutosizeTextarea } from "../_hooks/use-autosize-textarea";

const SPRING_SNAP: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 24,
  mass: 0.6,
};

const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 20,
  mass: 0.8,
};

const MAGNET_RADIUS = 8;

type ComposerProps = {
  draft: string;
  onDraftChange: (next: string) => void;
  provider: string;
  providerOptions: OptionItem[];
  onProviderChange: (next: string) => void;
  model: string;
  modelOptions: OptionItem[];
  onModelChange: (next: string) => void;
  size: string;
  onSizeChange: (next: string) => void;
  quality: string;
  onQualityChange: (next: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  isReady: boolean;
};

export function Composer({
  draft,
  onDraftChange,
  provider,
  providerOptions,
  onProviderChange,
  model,
  modelOptions,
  onModelChange,
  size,
  onSizeChange,
  quality,
  onQualityChange,
  onSubmit,
  isGenerating,
  isReady,
}: ComposerProps) {
  const textareaRef = useAutosizeTextarea(draft);
  const canSubmit = !isGenerating && draft.trim().length > 0 && isReady;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  const chipConfigs = [
    {
      key: "provider",
      ariaLabel: "Provider",
      value: provider,
      onChange: onProviderChange,
      options: providerOptions,
      disabled: isGenerating || providerOptions.length <= 1,
    },
    {
      key: "model",
      ariaLabel: "Model",
      value: model,
      onChange: onModelChange,
      options: modelOptions,
      disabled: isGenerating,
    },
    {
      key: "size",
      ariaLabel: "Size",
      value: size,
      onChange: onSizeChange,
      options: sizeOptions,
      disabled: isGenerating,
    },
    {
      key: "quality",
      ariaLabel: "Quality",
      value: quality,
      onChange: onQualityChange,
      options: qualityOptions,
      disabled: isGenerating,
    },
  ];

  return (
    <motion.div layout transition={SPRING_SOFT}>
      <InputGroup
        className={cn(
          "group/composer relative isolate rounded-2xl border border-hairline-strong bg-card",
          "shadow-[0_10px_30px_-12px_rgba(15,15,15,0.12),0_2px_6px_-2px_rgba(15,15,15,0.04)]",
          "focus-within:border-primary/60 focus-within:shadow-[0_18px_44px_-18px_rgba(86,69,212,0.32),0_2px_6px_-2px_rgba(15,15,15,0.04)]",
          "transition-[border-color,box-shadow] duration-300 ease-out",
        )}
      >
        <GeneratingStripe active={isGenerating} />

        <InputGroupAddon align="block-start" className="gap-1.5 px-3.5 pt-3">
          {chipConfigs.map((chip, i) => (
            <motion.div
              key={chip.key}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SNAP, delay: 0.04 + i * 0.05 }}
            >
              <ParamChip
                ariaLabel={chip.ariaLabel}
                value={chip.value}
                onValueChange={chip.onChange}
                options={chip.options}
                disabled={chip.disabled}
              />
            </motion.div>
          ))}
        </InputGroupAddon>

        <InputGroupTextarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate…"
          rows={1}
          disabled={isGenerating}
          className={cn(
            "max-h-48 min-h-11 px-4 py-3 text-[13px] leading-relaxed text-charcoal",
            "font-serif tracking-[0.005em] placeholder:font-serif placeholder:text-stone/75 placeholder:italic",
            "disabled:opacity-60",
          )}
        />

        <InputGroupAddon
          align="block-end"
          className="justify-between px-3.5 pb-3"
        >
          <SpinDice
            disabled={isGenerating}
            onClick={() => onDraftChange(pickRandomPrompt(draft))}
          />

          <div className="flex items-center gap-2">
            <MagneticSubmit
              isGenerating={isGenerating}
              canSubmit={canSubmit}
              onSubmit={onSubmit}
            />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </motion.div>
  );
}

const GeneratingStripe = React.memo(function GeneratingStripe({
  active,
}: {
  active: boolean;
}) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="stripe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 z-10 h-0.5 overflow-hidden rounded-full"
        >
          <motion.div
            animate={{ x: ["-120%", "220%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
            }}
            className="h-full w-1/3 bg-linear-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});

const SpinDice = React.memo(function SpinDice({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  const [rotation, setRotation] = React.useState(0);

  return (
    <motion.button
      type="button"
      onClick={() => {
        setRotation((r) => r + 360);
        onClick();
      }}
      disabled={disabled}
      aria-label="Surprise me with a sample prompt"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      transition={SPRING_SNAP}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full",
        "text-steel",
        "transition-colors duration-200",
        "hover:text-brand-purple-800",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-steel",
        "focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:outline-none",
      )}
    >
      <motion.span
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
        className="inline-flex"
      >
        <Dices className="size-5" strokeWidth={1.8} />
      </motion.span>
    </motion.button>
  );
});

const MagneticSubmit = React.memo(function MagneticSubmit({
  isGenerating,
  canSubmit,
  onSubmit,
}: {
  isGenerating: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!canSubmit) return;
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (event.clientX - cx) * 0.35;
      const dy = (event.clientY - cy) * 0.35;
      mx.set(Math.max(Math.min(dx, MAGNET_RADIUS), -MAGNET_RADIUS));
      my.set(Math.max(Math.min(dy, MAGNET_RADIUS), -MAGNET_RADIUS));
    },
    [canSubmit, mx, my],
  );

  const handleLeave = React.useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      className="relative"
    >
      <AnimatePresence>
        {isGenerating ? (
          <motion.span
            key="ring"
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.55, 0, 0.55],
            }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-0 rounded-full bg-primary/35"
          />
        ) : null}
      </AnimatePresence>

      <Button
        ref={buttonRef}
        type="button"
        size="icon"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Generate image"
        className={cn(
          "relative h-10 w-10 overflow-hidden rounded-full",
          "shadow-[0_6px_18px_-6px_rgba(86,69,212,0.55),inset_0_1px_0_0_rgba(255,255,255,0.18)]",
          "disabled:opacity-50 disabled:shadow-none",
          "transition-shadow duration-200 ease-out",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isGenerating ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
              transition={SPRING_SNAP}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Spinner className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.5, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              transition={SPRING_SNAP}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
});
