import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Database,
  KeyRound,
  Lock,
  type LucideIcon,
  MessagesSquare,
  Sliders,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";

import { AuroraBackdrop } from "@/app/_components/aurora-backdrop";
import { ImgenMarkBadge } from "@/app/_components/imgen-mark";
import { LiveCounter } from "@/app/_components/live-counter";
import { PromptMarquee } from "@/app/_components/prompt-marquee";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const githubRepoUrl = "https://github.com/wylu1037/imgen";
const githubIssuesUrl = `${githubRepoUrl}/issues`;
const githubDesignUrl = `${githubRepoUrl}/blob/main/DESIGN.md`;

const samplePrompts = [
  "Risograph illustration of a quiet bookstore on a rainy afternoon, limited palette of coral and indigo, grainy texture",
  "Studio photograph of a ceramic pour-over coffee setup, morning light, shallow depth of field, beige linen backdrop",
  "Misty alpine valley at golden hour, layered ridgelines, cinematic wide shot, low contrast, painterly atmosphere",
  "Editorial portrait by a north-facing window, 35mm film grain, mid-century interior, muted teal and brick palette",
  "Topographic blueprint of an imagined coastal town, hand-drawn linework, sepia ink on cream paper",
  "Cyanotype-style botanical print of fern fronds, deep indigo on bright white, soft paper texture",
] as const;

const featureToneMap = {
  lavender: "bg-tint-lavender",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
  sky: "bg-tint-sky",
} as const;

const features: ReadonlyArray<{
  tone: keyof typeof featureToneMap;
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    tone: "lavender",
    icon: MessagesSquare,
    title: "Chat-shaped canvas",
    body: "Each prompt produces an independent image. Threads keep iteration visible — no destructive edits, no lost variants.",
  },
  {
    tone: "peach",
    icon: Database,
    title: "SQLite in the browser",
    body: "WASM + OPFS. Your full history is queryable, exportable, and survives offline. No row ever touches a server we own.",
  },
  {
    tone: "mint",
    icon: Sliders,
    title: "Per-prompt parameters",
    body: "Provider, model, size, quality — adjust above the composer for every image. No global mode switching.",
  },
  {
    tone: "sky",
    icon: Tags,
    title: "Tags & a real gallery",
    body: "Mark favorites, filter by tag, jump back to any image. Built for browsing, not just scrolling chat history.",
  },
];

const steps = [
  {
    index: "01",
    title: "Drop in a key.",
    body: "Open Settings, paste an OpenAI-compatible key, set the base URL if you're on Azure or self-hosted. We persist it to localStorage only.",
  },
  {
    index: "02",
    title: "Pick your params.",
    body: "Choose model, size, quality on a per-prompt basis. Defaults sync from your last successful generation.",
  },
  {
    index: "03",
    title: "Generate. Iterate.",
    body: "Hit ↑ to send. Every image lands in your local gallery with full prompt history and zero round-trips back to our servers.",
  },
] as const;

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-8 pb-24 sm:px-8 lg:px-10">
      {/* 1. TopBar */}
      <header
        className="reveal flex items-center justify-between py-2"
        style={{ ["--reveal-delay" as string]: "40" }}
      >
        <div className="flex items-center gap-2.5">
          <ImgenMarkBadge />
          <span className="font-semibold tracking-tight text-ink">imgen</span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-stone uppercase">
            alpha
          </span>
        </div>
        <nav className="flex items-center gap-5">
          <Link
            href="/gallery"
            className="hidden text-sm text-steel transition-colors hover:text-ink sm:inline"
          >
            Gallery
          </Link>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-steel transition-colors hover:text-ink sm:inline"
          >
            GitHub
          </a>
          <Link href="/chat" className={buttonVariants({ size: "sm" })}>
            <Sparkles className="h-3.5 w-3.5" />
            Open workspace
          </Link>
        </nav>
      </header>

      {/* 2. Hero — antimetal-style top aurora hangs off the top edge and
           bleeds into the mockup below; reveal stagger drives the first paint */}
      <section className="relative isolate grid gap-6 pt-10 pb-12 text-center sm:pt-16 lg:pt-20">
        <div className="pointer-events-none absolute -top-32 right-[calc(50%-50vw)] bottom-[-15%] left-[calc(50%-50vw)] -z-10 overflow-hidden">
          <AuroraBackdrop tone="light" />
        </div>
        <div
          className="reveal text-micro-uppercase mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-steel shadow-subtle backdrop-blur"
          style={{ ["--reveal-delay" as string]: "60" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-primary opacity-70"
              style={{ animationDelay: "-0.8s" }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <Sparkles className="animate-float-soft h-3 w-3 text-primary" />
          Browser-first · BYOK
        </div>
        <h1
          className="reveal text-hero text-ink"
          style={{ ["--reveal-delay" as string]: "160" }}
        >
          The AI image workspace that{" "}
          <span className="font-serif font-normal text-primary italic">
            stays
          </span>{" "}
          on your device<span className="text-primary">.</span>
        </h1>
        <p
          className="reveal text-subtitle mx-auto mt-2 max-w-2xl text-slate"
          style={{ ["--reveal-delay" as string]: "260" }}
        >
          Bring your own provider key. Generate images in a focused chat. Every
          prompt, image, and tag is stored locally — your key never leaves the
          browser except to call the model.
        </p>
        <div
          className="reveal mt-6 flex flex-wrap items-center justify-center gap-3"
          style={{ ["--reveal-delay" as string]: "320" }}
        >
          <Link href="/chat" className={buttonVariants({ size: "lg" })}>
            <Sparkles />
            Start creating
          </Link>
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Star />
            Star on GitHub
          </a>
        </div>
        <p
          className="reveal mt-4 font-mono text-[10.5px] tracking-[0.2em] text-stone uppercase"
          style={{ ["--reveal-delay" as string]: "380" }}
        >
          no signup · no telemetry · your key, your storage
        </p>
      </section>

      {/* 3. Workspace Mockup — settles in 3D, lifts on hover */}
      <div
        aria-hidden="true"
        className="reveal group mx-auto w-full max-w-5xl sm:px-2"
        style={{ ["--reveal-delay" as string]: "440" }}
      >
        <div className="relative transform-[perspective(1400px)_rotateX(1.2deg)_rotateY(-0.6deg)] rounded-4xl p-px shadow-[0_34px_80px_-28px_rgba(15,15,15,0.34)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:transform-[perspective(1400px)_rotateX(0deg)_rotateY(0deg)_translateY(-6px)]">
          <div className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_25%_0%,rgba(214,182,246,0.52),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,232,212,0.6),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(250,250,249,0))] blur-2xl" />
          <div className="relative isolate overflow-hidden rounded-[calc(2rem-1px)] border border-hairline-soft bg-card/92 shadow-mockup backdrop-blur">
            <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-white to-transparent" />
            <span className="pointer-events-none absolute -top-28 left-10 h-52 w-52 rounded-full bg-tint-lavender/55 blur-3xl" />
            <span className="pointer-events-none absolute -right-20 top-32 h-48 w-48 rounded-full bg-tint-peach/50 blur-3xl" />

            <div className="relative z-10 flex items-center gap-3 border-b border-hairline-soft bg-surface-soft/80 px-4 py-3 backdrop-blur sm:px-5">
              <div className="flex items-center gap-2">
                <span
                  className="animate-pulse-soft size-2.5 rounded-full bg-tint-peach"
                  style={{ animationDelay: "-0.4s" }}
                />
                <span
                  className="animate-pulse-soft size-2.5 rounded-full bg-tint-yellow"
                  style={{ animationDelay: "-1.2s" }}
                />
                <span
                  className="animate-pulse-soft size-2.5 rounded-full bg-tint-mint"
                  style={{ animationDelay: "-2s" }}
                />
              </div>
              <span className="min-w-0 flex-1 text-center font-mono text-[10px] tracking-[0.2em] text-stone uppercase">
                Conversation · Risograph studies
              </span>
              <span className="hidden rounded-full border border-hairline-soft bg-card/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-steel uppercase shadow-subtle sm:inline-flex">
                OPFS ready
              </span>
            </div>

            <div className="relative z-10 overflow-hidden bg-card/70 px-4 py-6 sm:px-8 sm:py-9 lg:px-10">
              <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
              <span className="pointer-events-none absolute bottom-6 left-8 h-32 w-32 rounded-full bg-tint-mint/35 blur-3xl" />
              <div className="relative space-y-6">
                <MockupUserBubble text={samplePrompts[0]} />
                <MockupAssistantCard />
              </div>
            </div>

            <div className="relative z-10 border-t border-hairline-soft bg-surface-soft/75 p-4 backdrop-blur sm:p-5 lg:p-6">
              <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
              <div className="mb-3 flex flex-wrap gap-2">
                <MockupChip>openai</MockupChip>
                <MockupChip>gpt-image-2</MockupChip>
                <MockupChip>square</MockupChip>
                <MockupChip>auto</MockupChip>
              </div>
              <div className="relative flex min-h-16 items-end gap-3 rounded-[1.35rem] border border-hairline-strong bg-card/95 p-3.5 shadow-[0_18px_42px_-24px_rgba(15,15,15,0.26),0_2px_8px_-4px_rgba(15,15,15,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]">
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
                <span className="flex flex-1 items-center font-serif text-[13px] leading-relaxed text-stone italic">
                  Describe the image you want to generate
                  <span className="animate-type-caret ml-1 inline-block h-3.5 w-px translate-y-px bg-primary align-middle" />
                </span>
                <span className="animate-halo-pulse inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-cta">
                  <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Stat band — live counters animate when scrolled into view.
           the three numbers are the contract reduced to a single glance. */}
      <section className="reveal-on-scroll mt-20 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          mono="bytes uploaded"
          icon={Lock}
          value={0}
          suffix=""
          caption="to any server we own. ever."
        />
        <StatTile
          mono="local generations"
          icon={Database}
          value={100}
          suffix="%"
          caption="stored in your browser's OPFS."
          highlight
        />
        <StatTile
          mono="api key"
          icon={KeyRound}
          value={1}
          suffix=""
          caption="yours. never proxied, never logged."
        />
      </section>

      {/* 5. BYOK band */}
      <section className="reveal-on-scroll mt-20 grid gap-6 rounded-2xl bg-tint-yellow-bold p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
        <div>
          <Eyebrow icon={KeyRound} phase={-0.6}>
            The contract
          </Eyebrow>
          <h2 className="text-display mt-4 text-ink">
            Your key.{" "}
            <span className="font-serif text-primary italic">
              Your storage.
            </span>{" "}
            Your call.
          </h2>
          <p className="text-subtitle mt-4 max-w-xl text-slate">
            Imgen never stores your API key, never proxies your prompts, never
            sees your history. Configure any OpenAI-compatible endpoint —
            OpenAI, Azure OpenAI, or your own — and we forward each request
            once, then forget.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <FlowNode label="Browser" dashed />
            <FlowArrow />
            <FlowNode label="/api/generate" />
            <FlowArrow />
            <FlowNode label="Provider" />
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-charcoal/60 uppercase">
            <Lock className="h-3 w-3" />
            key + history never leave the browser
          </p>
        </div>
      </section>

      {/* 5. Feature grid */}
      <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            tone={feature.tone}
            icon={feature.icon}
            title={feature.title}
            body={feature.body}
          />
        ))}
      </section>

      {/* 6. How it works */}
      <section className="mt-24">
        <div className="text-center">
          <Eyebrow phase={-1.4}>Three steps</Eyebrow>
          <h2 className="text-display mt-4 text-ink">
            From zero to{" "}
            <span className="font-serif text-primary italic">first image</span>{" "}
            in a minute.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <StepCard
              key={step.index}
              index={step.index}
              title={step.title}
              body={step.body}
            />
          ))}
        </div>
      </section>

      {/* 7. Sample prompts — horizontal marquee drift, pauses on hover */}
      <section className="mt-24">
        <div className="text-center">
          <Eyebrow phase={-2}>Built for</Eyebrow>
          <h2 className="text-heading-2 mt-4 text-ink">
            Editorial work, not stock{" "}
            <span className="font-serif text-primary italic">photos.</span>
          </h2>
        </div>
        <div className="reveal-on-scroll mt-10">
          <PromptMarquee items={samplePrompts} speed={56} />
        </div>
      </section>

      {/* 8. Final CTA — antimetal-style deep aurora halo over brand-navy */}
      <section className="reveal-on-scroll relative isolate mt-24 overflow-hidden rounded-2xl bg-brand-navy p-10 text-center sm:p-16 lg:p-20">
        <AuroraBackdrop tone="deep" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] text-tint-lavender uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-white opacity-70"
                style={{ animationDelay: "-1.6s" }}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            ready when you are
          </span>
          <h2 className="text-display mt-4 text-white">
            Open the workspace.
            <br />
            <span className="font-serif text-tint-lavender italic">
              Bring your own key.
            </span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/chat" className={buttonVariants({ size: "lg" })}>
              <Sparkles />
              Start creating
            </Link>
            <Link
              href="/gallery"
              className={buttonVariants({ variant: "onDark", size: "lg" })}
            >
              Browse gallery
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <LandingFooter />
    </main>
  );
}

/* ─────────── inline sub-components ─────────── */

function Eyebrow({
  children,
  icon: Icon,
  phase = 0,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  phase?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-stone uppercase">
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-primary opacity-70"
          style={{ animationDelay: `${phase}s` }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      {Icon ? <Icon className="h-3.5 w-3.5 text-charcoal/60" /> : null}
      {children}
    </span>
  );
}

function MockupChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-hairline-soft bg-card/75 px-3 text-[10px] font-semibold tracking-[0.04em] text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-sm">
      {children}
      <ChevronDown className="size-3 text-stone" strokeWidth={1.8} />
    </span>
  );
}

function MockupUserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-[86%] rounded-[1.15rem] rounded-tr-md border border-white/65 bg-tint-lavender/78 px-4 py-3 text-[14px] leading-relaxed text-brand-purple-800 shadow-[0_12px_30px_-22px_rgba(57,28,87,0.42),inset_0_1px_0_rgba(255,255,255,0.72)] sm:max-w-[68%]">
        {text}
      </div>
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/80 bg-linear-to-br from-tint-peach via-tint-yellow to-tint-lavender shadow-subtle">
        <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-white/70" />
        <span className="absolute inset-x-1 bottom-1 h-2 rounded-full bg-white/28 blur-sm" />
      </span>
    </div>
  );
}

function MockupAssistantCard() {
  return (
    <div className="flex items-start gap-3">
      <ImgenMarkBadge className="h-8 w-8 shrink-0 shadow-subtle" />
      <div className="max-w-[88%] rounded-[1.35rem] rounded-tl-md border border-hairline-soft bg-card/90 p-3.5 shadow-[0_22px_52px_-34px_rgba(15,15,15,0.34),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur sm:max-w-[72%] sm:p-4">
        <div className="animate-gradient-pan relative aspect-square w-full max-w-72 overflow-hidden rounded-xl border border-white/55 bg-linear-to-br from-[#d97463] via-brand-purple-300 to-brand-navy-mid shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_18px_36px_-28px_rgba(10,21,48,0.45)] sm:max-w-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.5),transparent_46%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_78%,rgba(255,255,255,0.18),transparent_52%)]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/18 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-white/78 uppercase backdrop-blur-sm">
            render 04
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles
              className="animate-float-soft h-8 w-8 text-white/82 drop-shadow-sm"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute inset-x-4 bottom-4 h-px bg-linear-to-r from-transparent via-white/48 to-transparent" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-stone">
          <span className="rounded-full bg-surface-soft px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-charcoal">
            gpt-image-2
          </span>
          <span>1024×1024</span>
          <span className="text-hairline-strong">/</span>
          <span>medium</span>
        </div>
        <p className="mt-2 hidden text-[11px] text-stone tabular-nums sm:block">
          2:14 PM · 412 KB · Elapsed 6.2s
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-tint-lavender px-2.5 py-1 text-[10px] font-semibold text-brand-purple-800">
            riso
          </span>
          <span className="rounded-full bg-tint-peach px-2.5 py-1 text-[10px] font-semibold text-brand-orange-deep">
            bookstore
          </span>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border ${
        dashed ? "border-dashed" : "border-solid"
      } border-charcoal/15 bg-card px-3 py-2 font-mono text-[12px] text-charcoal`}
    >
      {label}
    </span>
  );
}

function FlowArrow() {
  return (
    <span className="flex flex-1 items-center justify-center gap-1 self-center text-charcoal/40">
      <span className="animate-dash-flow hidden h-px flex-1 sm:block" />
      <ArrowRight
        className="h-3.5 w-3.5 rotate-90 sm:rotate-0"
        strokeWidth={2}
      />
    </span>
  );
}

function FeatureCard({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: keyof typeof featureToneMap;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div
      className={`reveal-on-scroll group relative h-full overflow-hidden rounded-lg p-6 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,15,15,0.22)] sm:p-7 ${featureToneMap[tone]}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.5),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <Icon className="relative h-5 w-5 text-charcoal/70 transition-transform duration-500 group-hover:scale-110" />
      <h3 className="text-heading-5 relative mt-4 text-ink">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function StepCard({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <div className="reveal-on-scroll rounded-lg border border-border bg-card p-6 shadow-subtle transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,15,15,0.18)]">
      <span className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
        Step · {index}
      </span>
      <h3 className="text-heading-5 mt-3 text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function StatTile({
  mono,
  icon: Icon,
  value,
  suffix,
  caption,
  highlight,
}: {
  mono: string;
  icon: LucideIcon;
  value: number;
  suffix?: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-hairline-soft p-6 shadow-subtle transition-shadow duration-500 hover:shadow-[0_18px_40px_-22px_rgba(15,15,15,0.18)]",
        highlight ? "bg-tint-yellow-bold/40" : "bg-card",
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-stone uppercase">
          {mono}
        </span>
        <Icon className="h-3.5 w-3.5 text-charcoal/40" />
      </div>
      <div
        className={cn(
          "mt-3 flex items-baseline gap-0.5 text-[44px] leading-none font-semibold tracking-tight",
          highlight ? "text-primary" : "text-ink",
        )}
      >
        <LiveCounter to={value} duration={1.6} />
        {suffix ? (
          <span className="text-[28px] text-stone">{suffix}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate">{caption}</p>
    </div>
  );
}

function LandingFooter() {
  return (
    <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-[12px] text-stone sm:flex-row">
      <div className="flex items-center gap-2">
        <ImgenMarkBadge />
        <span>Imgen · open source · MIT</span>
      </div>
      <div className="flex items-center gap-5">
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-steel transition-colors hover:text-ink"
        >
          GitHub
        </a>
        <a
          href={githubIssuesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-steel transition-colors hover:text-ink"
        >
          Issues
        </a>
        <a
          href={githubDesignUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-steel transition-colors hover:text-ink"
        >
          DESIGN.md
        </a>
      </div>
    </footer>
  );
}
