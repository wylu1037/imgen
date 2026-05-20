import Link from "next/link";
import { Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const statTiles: StatTileProps[] = [
  { tone: "lavender", label: "Model", value: "Your choice" },
  { tone: "peach", label: "Storage", value: "On-device" },
  { tone: "mint", label: "Privacy", value: "Key stays local" },
  { tone: "sky", label: "Cost", value: "Pay per image" },
];

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-8 sm:px-8 lg:px-10">
      <section className="grid gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-16">
        <div className="max-w-3xl">
          <div
            className="reveal text-micro-uppercase mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-steel shadow-subtle"
            style={{ ["--reveal-delay" as string]: "60" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <Sparkles className="animate-float-soft h-3 w-3 text-primary" />
            Configurable image API
          </div>
          <h1
            className="reveal text-hero text-ink"
            style={{ ["--reveal-delay" as string]: "160" }}
          >
            AI Image Workspace<span className="text-primary">.</span>
          </h1>
          <p
            className="reveal text-subtitle mt-6 max-w-xl text-slate"
            style={{ ["--reveal-delay" as string]: "260" }}
          >
            Bring your own provider. Generate images in a focused chat, with
            history saved on-device — no servers in the loop after the prompt
            leaves.
          </p>
          <div
            className="reveal mt-7 flex flex-wrap items-center gap-3"
            style={{ ["--reveal-delay" as string]: "320" }}
          >
            <Link href="/chat" className={buttonVariants({ size: "lg" })}>
              <Sparkles />
              Start creating
            </Link>
            <a
              href="https://platform.openai.com/docs/api-reference/images"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View API docs
            </a>
          </div>
        </div>
        <div
          className="reveal grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
          style={{ ["--reveal-delay" as string]: "340" }}
        >
          {statTiles.map((tile) => (
            <StatTile key={tile.label} {...tile} />
          ))}
        </div>
      </section>
    </main>
  );
}

const tileToneMap = {
  lavender: { bg: "bg-tint-lavender", text: "text-brand-purple-800" },
  peach: { bg: "bg-tint-peach", text: "text-brand-orange-deep" },
  mint: { bg: "bg-tint-mint", text: "text-brand-green" },
  sky: { bg: "bg-tint-sky", text: "text-link-blue-pressed" },
} as const;

type StatTileProps = {
  label: string;
  value: string;
  tone: keyof typeof tileToneMap;
};

function StatTile({ label, value, tone }: StatTileProps) {
  const palette = tileToneMap[tone];
  return (
    <div
      className={`group rounded-md ${palette.bg} px-4 py-3 transition-transform duration-300 ease-out hover:-translate-y-0.5`}
    >
      <div className={`text-micro-uppercase ${palette.text} opacity-70`}>
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-charcoal">{value}</div>
    </div>
  );
}
