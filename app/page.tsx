import Link from "next/link";

import {
  ArrowRight,
  ArrowUp,
  Database,
  GitBranch,
  KeyRound,
  Layers3,
  type LucideIcon,
  Palette,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";

import { AuroraBackdrop } from "@/app/_components/aurora-backdrop";
import { ImgenMarkBadge } from "@/app/_components/imgen-mark";
import { PromptMarquee } from "@/app/_components/prompt-marquee";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const githubRepoUrl = "https://github.com/wylu1037/imgen";
const githubIssuesUrl = `${githubRepoUrl}/issues`;
const githubDesignUrl = `${githubRepoUrl}/blob/main/DESIGN.md`;

const samplePrompts = [
  "Editorial image system for a rainy bookstore launch, risograph texture, coral ink, indigo shadows, quiet shelves",
  "Ceramic coffee ritual product study, north-window light, soft linen backdrop, muted sand palette, shallow focus",
  "Alpine travel poster series at golden hour, layered ridgelines, cinematic crop, low-contrast painterly atmosphere",
  "Founder portrait in a mid-century studio, 35mm film grain, teal wall, brick textile, restrained editorial lighting",
  "Coastal town map as a design artifact, topographic linework, sepia ink, cream stock, labeled neighborhoods",
  "Cyanotype botanical archive for a gallery wall, fern fronds, deep indigo wash, bright paper grain, quiet margin",
] as const;

const trustNotes = [
  {
    icon: ShieldCheck,
    label: "Local-first archive",
  },
  {
    icon: KeyRound,
    label: "Bring your own key",
  },
  {
    icon: GitBranch,
    label: "Open-source workflow",
  },
] as const;

const problemRows = [
  {
    before: "A good prompt disappears into chat scrollback.",
    after: "The prompt becomes a reusable creative brief.",
  },
  {
    before: "Model, size, quality, and provider choices get separated from the image.",
    after: "Every output keeps its exact production context attached.",
  },
  {
    before: "Generated images pile up as one-off downloads.",
    after: "Artifacts land in a searchable, tagged local gallery.",
  },
] as const;

const featureToneMap = {
  lavender: {
    card: "bg-tint-lavender",
    aura: "bg-brand-purple-300/45",
  },
  peach: {
    card: "bg-tint-peach",
    aura: "bg-brand-orange/20",
  },
  mint: {
    card: "bg-tint-mint",
    aura: "bg-brand-green/18",
  },
  sky: {
    card: "bg-tint-sky",
    aura: "bg-link-blue/16",
  },
} as const;

type FeaturePreview = "brief" | "library" | "route" | "gallery";

const features: ReadonlyArray<{
  tone: keyof typeof featureToneMap;
  icon: LucideIcon;
  title: string;
  kicker: string;
  body: string;
  preview: FeaturePreview;
  wide?: boolean;
}> = [
  {
    tone: "lavender",
    icon: Palette,
    title: "Creative briefs, not prompt scraps",
    kicker: "Compose",
    body: "Write with palette, medium, crop, texture, and reference context beside provider settings so the prompt can drive a full visual series.",
    preview: "brief",
    wide: true,
  },
  {
    tone: "peach",
    icon: Database,
    title: "A local library with memory",
    kicker: "Archive",
    body: "SQLite WASM + OPFS keeps conversations, metadata, images, favorites, and tags together in the browser.",
    preview: "library",
  },
  {
    tone: "mint",
    icon: Route,
    title: "Provider routing stays explicit",
    kicker: "Route",
    body: "Point Imgen at OpenAI, Azure OpenAI, or compatible endpoints and keep model choices visible per request.",
    preview: "route",
  },
  {
    tone: "sky",
    icon: Tags,
    title: "Gallery curation built in",
    kicker: "Curate",
    body: "Favorite, tag, filter, and jump back to the source conversation instead of losing useful generations in downloads.",
    preview: "gallery",
  },
] as const;

const steps = [
  {
    index: "01",
    title: "Connect a provider",
    body: "Add an OpenAI-compatible key and optional base URL. Credentials stay in browser storage or OPFS until a generation request.",
  },
  {
    index: "02",
    title: "Write a reusable brief",
    body: "Keep prompt language, model, size, quality, and routing controls together before you generate.",
  },
  {
    index: "03",
    title: "Curate the artifact",
    body: "Each result lands in the local gallery with tags, metadata, and a route back to the source conversation.",
  },
] as const;

const artifactStrip = [
  {
    title: "Bookstore",
    meta: "risograph · coral",
    gradient: "from-[#d97463] via-brand-purple-300 to-brand-navy-mid",
  },
  {
    title: "Ceramic",
    meta: "linen · north light",
    gradient: "from-tint-peach via-tint-yellow to-brand-orange/70",
  },
  {
    title: "Cyanotype",
    meta: "botanical · indigo",
    gradient: "from-link-blue via-brand-purple to-brand-navy",
  },
] as const;

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-8 pb-24 sm:px-8 lg:px-10">
      <header
        className="reveal flex items-center justify-between py-2"
        style={{ ["--reveal-delay" as string]: "40" }}
      >
        <Link href="/" className="relative flex items-center gap-2.5">
          <ImgenMarkBadge />
          <span className="inline-flex items-start gap-0.5">
            <span className="font-serif text-[21px] leading-none font-normal tracking-[-0.055em] text-ink italic">
              imgen
            </span>
            <span
              aria-label="alpha"
              title="alpha"
              className="-mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-hairline-soft bg-surface-soft font-mono text-[10px] text-stone shadow-subtle"
            >
              α
            </span>
          </span>
        </Link>
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
            Open workbench
          </Link>
        </nav>
      </header>

      <section className="relative isolate grid gap-11 pt-10 pb-14 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-12 lg:pt-20">
        <div className="pointer-events-none absolute -top-32 right-[calc(50%-50vw)] bottom-[-18%] left-[calc(50%-50vw)] -z-10 overflow-hidden">
          <AuroraBackdrop tone="light" />
        </div>

        <div className="relative text-left">
          <div
            className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] text-steel shadow-subtle backdrop-blur"
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
            Local-first AI image workbench
          </div>
          <h1
            className="reveal text-hero mt-6 max-w-3xl text-ink"
            style={{ ["--reveal-delay" as string]: "150" }}
          >
            Turn image prompts into a reusable{" "}
            <span className="font-serif font-normal text-primary italic">
              artifact system
            </span>
            .
          </h1>
          <p
            className="reveal text-subtitle mt-5 max-w-2xl text-slate"
            style={{ ["--reveal-delay" as string]: "240" }}
          >
            Imgen keeps prompts, provider settings, model parameters, generated
            images, tags, and conversations tied together in a browser-first
            workspace.
          </p>
          <div
            className="reveal mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ ["--reveal-delay" as string]: "310" }}
          >
            <Link href="/chat" className={buttonVariants({ size: "lg" })}>
              <Sparkles />
              Open the workbench
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
          <div
            className="reveal mt-6 grid gap-2 sm:grid-cols-3 lg:max-w-2xl"
            style={{ ["--reveal-delay" as string]: "370" }}
          >
            {trustNotes.map((note) => (
              <ProofPill key={note.label} {...note} />
            ))}
          </div>
          <p
            className="reveal mt-4 max-w-xl text-[12px] leading-relaxed text-stone"
            style={{ ["--reveal-delay" as string]: "430" }}
          >
            Provider credentials live in browser storage or OPFS and are sent
            through /api/generate only when you request a generation.
          </p>
        </div>

        <HeroArtifactMockup />
      </section>

      <DataPathStrip />

      <ProblemSolution />

      <section className="mt-24">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr] lg:items-end">
          <div>
            <Eyebrow icon={Layers3} phase={-1.1}>
              Artifact workspace
            </Eyebrow>
            <h2 className="text-display mt-4 text-ink">
              Everything around the image stays{" "}
              <span className="font-serif text-primary italic">attached</span>.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate lg:justify-self-end">
            The workspace is designed around the artifact: the brief that made
            it, the provider that generated it, and the gallery context that
            helps you reuse it later.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {features.map((feature) => (
            <BentoFeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:items-start">
        <div className="max-w-2xl text-left">
          <Eyebrow phase={-1.4}>Three moves</Eyebrow>
          <h2 className="text-display mt-4 text-ink">
            From empty gallery to reusable{" "}
            <span className="font-serif text-primary italic">image system</span>
            .
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {steps.map((step) => (
            <StepCard key={step.index} {...step} />
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div>
            <Eyebrow phase={-2}>Reusable briefs</Eyebrow>
            <h2 className="text-heading-2 mt-4 text-ink">
              Prompts that behave like{" "}
              <span className="font-serif text-primary italic">
                design specs.
              </span>
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate lg:justify-self-end">
            Keep the language specific enough for a series: palette, medium,
            crop, texture, and context travel with each artifact into the local
            gallery.
          </p>
        </div>
        <div className="reveal-on-scroll mt-10">
          <PromptMarquee items={samplePrompts} speed={56} />
        </div>
      </section>

      <section className="reveal-on-scroll relative isolate mt-24 overflow-hidden rounded-2xl bg-brand-navy p-8 text-left sm:p-16 lg:grid lg:grid-cols-[1fr_0.72fr] lg:items-end lg:p-20">
        <AuroraBackdrop tone="deep" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.06em] text-tint-lavender">
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
            Build the image library.
            <br />
            <span className="font-serif text-tint-lavender italic">
              Keep the production context.
            </span>
          </h2>
        </div>
        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:justify-end">
          <Link href="/chat" className={buttonVariants({ size: "lg" })}>
            <Sparkles />
            Open the workbench
          </Link>
          <Link
            href="/gallery"
            className={buttonVariants({ variant: "onDark", size: "lg" })}
          >
            Browse gallery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

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
    <span className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.06em] text-stone">
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

function ProofPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <article className="rounded-full border border-hairline-soft bg-card/78 px-3.5 py-2 shadow-subtle backdrop-blur">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-charcoal/70">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
    </article>
  );
}

function HeroArtifactMockup() {
  return (
    <div
      aria-hidden="true"
      className="reveal group w-full min-w-0 lg:translate-x-4"
      style={{ ["--reveal-delay" as string]: "440" }}
    >
      <div className="relative transform-[perspective(1400px)_rotateX(1.2deg)_rotateY(-0.8deg)] rounded-4xl p-px shadow-[0_34px_80px_-28px_rgba(15,15,15,0.34)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:transform-[perspective(1400px)_rotateX(0deg)_rotateY(0deg)_translateY(-6px)]">
        <div className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_25%_0%,rgba(214,182,246,0.42),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,232,212,0.58),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.68),rgba(250,250,249,0))] blur-2xl" />
        <div className="relative isolate overflow-hidden rounded-[calc(2rem-1px)] border border-hairline-soft bg-card/92 shadow-mockup backdrop-blur">
          <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-linear-to-r from-transparent via-white to-transparent" />
          <span className="pointer-events-none absolute -top-28 left-10 h-52 w-52 rounded-full bg-tint-lavender/45 blur-3xl" />
          <span className="pointer-events-none absolute top-32 -right-20 h-48 w-48 rounded-full bg-tint-peach/45 blur-3xl" />

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
            <span className="min-w-0 flex-1 truncate text-center font-mono text-[11px] tracking-[0.06em] text-stone">
              Artifact workbench
            </span>
            <span className="hidden rounded-full border border-hairline-soft bg-card/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-steel shadow-subtle sm:inline-flex">
              OPFS synced
            </span>
          </div>

          <div className="relative z-10 grid gap-4 bg-card/70 p-4 sm:p-5 lg:grid-cols-[1fr_0.72fr] lg:p-6">
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/65 bg-surface-soft p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_20px_46px_-34px_rgba(15,15,15,0.34)]">
              <div className="animate-gradient-pan relative aspect-4/3 overflow-hidden rounded-[1.05rem] border border-white/60 bg-linear-to-br from-[#d97463] via-brand-purple-300 to-brand-navy-mid shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.54),transparent_44%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_80%,rgba(255,255,255,0.2),transparent_52%)]" />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                  <div className="rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-white shadow-subtle backdrop-blur">
                    <p className="font-mono text-[10px] tracking-[0.08em] opacity-80">
                      generated artifact
                    </p>
                    <p className="mt-1 font-serif text-[18px] leading-none italic">
                      Rainy bookstore
                    </p>
                  </div>
                  <Sparkles
                    className="animate-float-soft h-7 w-7 text-white/82 drop-shadow-sm"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-stone">
                <MockupTag>gpt-image-2</MockupTag>
                <span>1024×1024</span>
                <span className="text-hairline-strong">/</span>
                <span>medium quality</span>
              </div>
            </div>

            <div className="grid gap-3">
              <MockupPanel title="Provider route">
                <MockupField label="Provider" value="openai-compatible" />
                <MockupField label="Model" value="gpt-image-2" />
                <MockupField label="Relay" value="/api/generate" />
              </MockupPanel>
              <MockupPanel title="Attached context">
                <div className="flex flex-wrap gap-1.5">
                  <MockupTag>editorial</MockupTag>
                  <MockupTag>risograph</MockupTag>
                  <MockupTag>coral ink</MockupTag>
                </div>
                <div className="mt-3 h-2 rounded-full bg-tint-lavender">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
              </MockupPanel>
            </div>
          </div>

          <div className="relative z-10 border-t border-hairline-soft bg-surface-soft/75 p-4 backdrop-blur sm:p-5">
            <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-[0.06em] text-stone">
                Local artifact strip
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-primary">
                saved
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {artifactStrip.map((artifact) => (
                <ArtifactMiniCard key={artifact.title} {...artifact} />
              ))}
            </div>
            <div className="mt-3 flex min-h-12 items-center gap-3 rounded-[1.15rem] border border-hairline-strong bg-card/95 p-3 shadow-[0_18px_42px_-24px_rgba(15,15,15,0.26),0_2px_8px_-4px_rgba(15,15,15,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]">
              <span className="flex flex-1 items-center font-serif text-[13px] leading-relaxed text-stone italic">
                Compose the next reusable image brief
                <span className="animate-type-caret ml-1 inline-block h-3.5 w-px translate-y-px bg-primary align-middle" />
              </span>
              <span className="animate-halo-pulse inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-cta">
                <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.05rem] border border-hairline-soft bg-card/80 p-3 shadow-subtle backdrop-blur">
      <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-stone">
        {title}
      </p>
      {children}
    </div>
  );
}

function MockupField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-hairline-soft py-2 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-[11px] text-stone">{label}</span>
      <span className="truncate font-mono text-[10px] text-charcoal">{value}</span>
    </div>
  );
}

function MockupTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-hairline-soft bg-card/75 px-2.5 font-mono text-[10px] tracking-[0.04em] text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-sm">
      {children}
    </span>
  );
}

function ArtifactMiniCard({
  title,
  meta,
  gradient,
}: {
  title: string;
  meta: string;
  gradient: string;
}) {
  return (
    <article className="flex items-center gap-2 rounded-xl border border-hairline-soft bg-card/72 p-2 shadow-subtle">
      <span
        className={cn(
          "h-10 w-10 shrink-0 rounded-lg bg-linear-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
          gradient,
        )}
      />
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-medium text-ink">
          {title}
        </span>
        <span className="block truncate text-[10px] text-stone">{meta}</span>
      </span>
    </article>
  );
}

function ProblemSolution() {
  return (
    <section className="reveal-on-scroll mt-20 grid gap-4 overflow-hidden rounded-2xl border border-hairline-soft bg-card p-4 shadow-subtle sm:p-5 lg:grid-cols-[0.82fr_1.18fr] lg:p-6">
      <div className="rounded-[1.35rem] bg-tint-gray p-6 sm:p-8">
        <Eyebrow phase={-0.8}>Why it exists</Eyebrow>
        <h2 className="text-display mt-4 text-ink">
          Stop treating image generation like a{" "}
          <span className="font-serif text-primary italic">slot machine</span>.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate">
          The best generations usually come from a repeatable system: precise
          language, known model settings, and a way to return to the source.
        </p>
      </div>
      <div className="grid gap-3">
        {problemRows.map((row, index) => (
          <div
            key={row.before}
            className="grid gap-3 rounded-[1.15rem] border border-hairline-soft bg-surface-soft/70 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
          >
            <p className="rounded-lg bg-card px-3 py-2 text-sm leading-relaxed text-stone shadow-subtle">
              {row.before}
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-[11px] text-white shadow-cta">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="rounded-lg bg-tint-mint px-3 py-2 text-sm leading-relaxed text-charcoal shadow-subtle">
              {row.after}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BentoFeatureCard({
  tone,
  icon: Icon,
  title,
  kicker,
  body,
  preview,
  wide,
}: {
  tone: keyof typeof featureToneMap;
  icon: LucideIcon;
  title: string;
  kicker: string;
  body: string;
  preview: FeaturePreview;
  wide?: boolean;
}) {
  const toneClasses = featureToneMap[tone];

  return (
    <article
      className={cn(
        "reveal-on-scroll group relative h-full overflow-hidden rounded-2xl p-5 shadow-subtle transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_58px_-32px_rgba(15,15,15,0.24)] sm:p-6",
        toneClasses.card,
        wide ? "lg:col-span-2" : "",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125",
          toneClasses.aura,
        )}
      />
      <div className="relative flex items-center justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-card/64 text-charcoal shadow-subtle backdrop-blur">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.06em] text-charcoal/55">
          {kicker}
        </span>
      </div>
      <div className={cn("relative mt-6 grid gap-5", wide ? "sm:grid-cols-[0.9fr_1fr] sm:items-end" : "")}>
        <div>
          <h3 className="text-heading-5 text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
        </div>
        <FeaturePreviewCard preview={preview} />
      </div>
    </article>
  );
}

function FeaturePreviewCard({ preview }: { preview: FeaturePreview }) {
  if (preview === "brief") {
    return (
      <div className="rounded-[1.15rem] border border-white/58 bg-card/58 p-3 shadow-subtle backdrop-blur">
        <p className="font-serif text-[14px] leading-relaxed text-charcoal italic">
          “rainy bookstore launch, risograph texture, coral ink, indigo
          shadows…”
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <MockupTag>palette</MockupTag>
          <MockupTag>texture</MockupTag>
          <MockupTag>series</MockupTag>
        </div>
      </div>
    );
  }

  if (preview === "library") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {artifactStrip.map((artifact) => (
          <span
            key={artifact.title}
            className={cn(
              "aspect-square rounded-xl bg-linear-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_10px_24px_-18px_rgba(15,15,15,0.3)]",
              artifact.gradient,
            )}
          />
        ))}
      </div>
    );
  }

  if (preview === "route") {
    return (
      <div className="rounded-[1.15rem] border border-white/58 bg-card/58 p-3 shadow-subtle backdrop-blur">
        <div className="flex items-center gap-2">
          <FlowNode label="Browser" dashed />
          <FlowArrow />
          <FlowNode label="Provider" />
        </div>
        <p className="mt-3 font-mono text-[11px] tracking-[0.04em] text-charcoal/55">
          transient relay only
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.15rem] border border-white/58 bg-card/58 p-3 shadow-subtle backdrop-blur">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <MockupTag>favorite</MockupTag>
        <MockupTag>tagged</MockupTag>
      </div>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-white/70" />
        <div className="h-2 w-2/3 rounded-full bg-primary/42" />
      </div>
    </div>
  );
}

function FlowNode({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center justify-center rounded-md border bg-card px-2.5 py-2 font-mono text-[10px] text-charcoal",
        dashed ? "border-dashed" : "border-solid",
        "border-charcoal/15",
      )}
    >
      {label}
    </span>
  );
}

function FlowArrow() {
  const arrowShape =
    "M1 5.45H105.5V3.1L119 6L105.5 8.9V6.55H1C0.7 6.55 0.45 6.3 0.45 6C0.45 5.7 0.7 5.45 1 5.45Z";

  return (
    <span className="flex min-w-8 flex-1 items-center self-center text-charcoal/40">
      <svg
        viewBox="0 0 120 12"
        className="h-3 w-full overflow-visible"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="flow-arrow-shape">
            <path d={arrowShape} />
          </clipPath>
          <linearGradient id="flow-arrow-shine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="transparent" />
            <stop offset="0.5" stopColor="var(--primary)" stopOpacity="0.72" />
            <stop offset="1" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={arrowShape} fill="currentColor" opacity="0.24" />
        <g clipPath="url(#flow-arrow-shape)">
          <rect
            x="-44"
            y="0"
            width="44"
            height="12"
            fill="url(#flow-arrow-shine)"
          >
            <animate
              attributeName="x"
              dur="2.6s"
              repeatCount="indefinite"
              values="-44;120"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
            />
          </rect>
        </g>
      </svg>
    </span>
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
    <article className="reveal-on-scroll grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,15,15,0.18)] sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tint-lavender font-mono text-[11px] tracking-[0.16em] text-primary">
        {index}
      </span>
      <span>
        <h3 className="text-heading-5 text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
      </span>
    </article>
  );
}

function DataPathStrip() {
  return (
    <section className="reveal-on-scroll mt-14 rounded-full border border-hairline-soft bg-card/72 px-4 py-3 shadow-subtle backdrop-blur lg:mt-16">
      <div className="flex flex-col gap-3 text-sm text-charcoal sm:flex-row sm:items-center sm:justify-between">
        <DataPathNode icon={Database} label="Browser workspace" detail="Prompts, keys, images" />
        <DataPathConnector />
        <DataPathNode icon={ShieldCheck} label="OPFS + SQLite" detail="Local archive" />
        <DataPathConnector />
        <DataPathNode icon={Route} label="/api/generate" detail="Transient relay" />
      </div>
    </section>
  );
}

function DataPathNode({
  icon: Icon,
  label,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tint-lavender text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{label}</span>
        <span className="block truncate text-[11px] text-stone">{detail}</span>
      </span>
    </div>
  );
}

function DataPathConnector() {
  return (
    <span className="hidden h-px min-w-10 flex-1 bg-linear-to-r from-transparent via-hairline-strong to-transparent sm:block" />
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
