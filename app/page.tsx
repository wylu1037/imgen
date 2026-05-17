"use client"

import Image from "next/image"
import * as React from "react"
import { ImageIcon, Loader2, Settings, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { ImageSelect } from "@/components/image-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const providerSettingsStorageKey = "imgen.providerSettings"
const defaultImageModel = "gpt-image-2"

const sizeOptions = [
  { label: "Square", meta: "1024 × 1024", value: "1024x1024" },
  { label: "Portrait", meta: "1024 × 1536", value: "1024x1536" },
  { label: "Landscape", meta: "1536 × 1024", value: "1536x1024" },
  { label: "Auto", meta: "Model picks", value: "auto" },
]

const qualityOptions = [
  { label: "Auto", value: "auto" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
]

type ProviderSettings = {
  apiKey: string
  baseURL: string
  defaultModel: string
}

function readProviderSettings(): ProviderSettings {
  if (typeof window === "undefined") {
    return {
      apiKey: "",
      baseURL: "",
      defaultModel: defaultImageModel,
    }
  }

  const storedSettings = window.localStorage.getItem(providerSettingsStorageKey)

  if (!storedSettings) {
    return {
      apiKey: "",
      baseURL: "",
      defaultModel: defaultImageModel,
    }
  }

  try {
    const settings = JSON.parse(storedSettings) as Partial<ProviderSettings>

    return {
      apiKey: settings.apiKey || "",
      baseURL: settings.baseURL || "",
      defaultModel: settings.defaultModel?.trim() || defaultImageModel,
    }
  } catch {
    window.localStorage.removeItem(providerSettingsStorageKey)

    return {
      apiKey: "",
      baseURL: "",
      defaultModel: defaultImageModel,
    }
  }
}

type GenerateResponse = {
  image?: string
  model?: string
  revisedPrompt?: string
  error?: string
}

export default function Home() {
  const [providerSettings, setProviderSettings] = React.useState(readProviderSettings)
  const { apiKey, baseURL, defaultModel } = providerSettings
  const [model, setModel] = React.useState(providerSettings.defaultModel)
  const [prompt, setPrompt] = React.useState(
    "A warm minimal desk workspace for AI image generation, Notion-inspired product design, soft surfaces, editorial lighting",
  )
  const [size, setSize] = React.useState("1024x1024")
  const [quality, setQuality] = React.useState("auto")
  const [image, setImage] = React.useState("")
  const [usedModel, setUsedModel] = React.useState("")
  const [revisedPrompt, setRevisedPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  React.useEffect(() => {
    window.localStorage.setItem(providerSettingsStorageKey, JSON.stringify(providerSettings))
  }, [providerSettings])

  function updateProviderSetting(key: keyof ProviderSettings, value: string) {
    setProviderSettings((settings) => ({
      ...settings,
      [key]: value,
    }))
  }

  function handleDefaultModelChange(value: string) {
    setProviderSettings((settings) => {
      const nextDefaultModel = value || defaultImageModel

      setModel((currentModel) => {
        if (!currentModel.trim() || currentModel === settings.defaultModel) {
          return nextDefaultModel
        }

        return currentModel
      })

      return {
        ...settings,
        defaultModel: value,
      }
    })
  }

  function handleClearSettings() {
    window.localStorage.removeItem(providerSettingsStorageKey)
    setProviderSettings({
      apiKey: "",
      baseURL: "",
      defaultModel: defaultImageModel,
    })
    setModel(defaultImageModel)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedApiKey = apiKey.trim()
    const trimmedBaseURL = baseURL.trim()
    const trimmedModel = model.trim()

    if (!trimmedApiKey) {
      toast.error("Enter your API key in provider settings.")
      return
    }

    if (!trimmedModel) {
      toast.error("Enter an image model.")
      return
    }

    if (trimmedBaseURL) {
      try {
        new URL(trimmedBaseURL)
      } catch {
        toast.error("Base URL must be a valid URL.")
        return
      }
    }

    setImage("")
    setRevisedPrompt("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: trimmedModel,
          size,
          quality,
          apiKey: trimmedApiKey,
          baseURL: trimmedBaseURL,
        }),
      })
      const data = (await response.json()) as GenerateResponse

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed.")
      }

      setImage(data.image || "")
      setUsedModel(data.model || trimmedModel)
      setRevisedPrompt(data.revisedPrompt || "")
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Image generation failed."
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-8 sm:px-8 lg:px-10">
      <div className="relative flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
          aria-expanded={isSettingsOpen}
          aria-controls="provider-settings-panel"
        >
          <Settings />
          Settings
        </Button>
        {isSettingsOpen ? (
          <div
            id="provider-settings-panel"
            className="absolute right-0 top-11 z-20 w-[min(360px,calc(100vw-2.5rem))] space-y-4 rounded-lg border border-border bg-card p-5 shadow-card"
          >
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Provider settings
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-steel">
                Provider credentials are saved locally in this browser.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="api-key"
                className="text-micro-uppercase text-steel"
              >
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(event) => updateProviderSetting("apiKey", event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="base-url"
                className="text-micro-uppercase text-steel"
              >
                Base URL
              </Label>
              <Input
                id="base-url"
                value={baseURL}
                onChange={(event) => updateProviderSetting("baseURL", event.target.value)}
                placeholder="Leave blank for OpenAI default"
                autoComplete="off"
              />
              <p className="text-[13px] leading-5 text-steel">
                Optional. Only use a trusted provider endpoint.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="default-model"
                className="text-micro-uppercase text-steel"
              >
                Default model
              </Label>
              <Input
                id="default-model"
                value={defaultModel}
                onChange={(event) => handleDefaultModelChange(event.target.value)}
                placeholder={defaultImageModel}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSettings}
              >
                Clear saved settings
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <section className="grid gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-16">
        <div className="max-w-3xl">
          <div
            className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-micro-uppercase text-steel shadow-subtle"
            style={{ ["--reveal-delay" as string]: "60" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-pulse-soft" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <Sparkles className="h-3 w-3 text-primary animate-float-soft" />
            Configurable image API
          </div>
          <h1
            className="reveal text-hero text-ink"
            style={{ ["--reveal-delay" as string]: "160" }}
          >
            AI Image Workspace<span className="text-primary">.</span>
          </h1>
          <p
            className="reveal mt-6 max-w-xl text-subtitle text-slate"
            style={{ ["--reveal-delay" as string]: "260" }}
          >
            Configure model, size, and quality in a warm minimal console, then
            generate images through a server-side OpenAI API route.
          </p>
          <div
            className="reveal mt-7 flex flex-wrap items-center gap-3"
            style={{ ["--reveal-delay" as string]: "320" }}
          >
            <Button asChild size="lg">
              <a href="#workspace">
                <Sparkles />
                Open workspace
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://platform.openai.com/docs/api-reference/images"
                target="_blank"
                rel="noreferrer"
              >
                View API docs
              </a>
            </Button>
          </div>
        </div>
        <div
          className="reveal grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
          style={{ ["--reveal-delay" as string]: "340" }}
        >
          <StatTile tone="lavender" label="Model" value="Editable" />
          <StatTile tone="peach" label="Output" value="Base64 / URL" />
          <StatTile tone="mint" label="API Key" value="Stored locally" />
          <StatTile tone="sky" label="Latency" value="≈ 6–12s" />
        </div>
      </section>

      <section
        id="workspace"
        className="grid flex-1 items-stretch gap-6 pb-10 lg:grid-cols-[440px_1fr]"
      >
        <Card
          className="reveal overflow-hidden"
          style={{ ["--reveal-delay" as string]: "420" }}
        >
          <CardHeader className="border-b border-hairline-soft bg-tint-cream/50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>
                  Generate<span className="text-primary">.</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Store provider settings in this browser and send credentials
                  only when generating an image.
                </CardDescription>
              </div>
              <div className="rounded-md border border-border bg-card p-2 shadow-subtle">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor="model"
                    className="text-micro-uppercase text-steel"
                  >
                    Model
                  </Label>
                  <span className="rounded-xs bg-tint-lavender px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-purple-800">
                    Request scope
                  </span>
                </div>
                <Input
                  id="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="gpt-image-1 or gpt-image-2"
                />
                <p className="text-[13px] leading-5 text-steel">
                  Prefilled from your default model setting. Override it for
                  this request when needed.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-micro-uppercase text-steel">
                    Size
                  </Label>
                  <ImageSelect
                    ariaLabel="Select image size"
                    value={size}
                    onValueChange={setSize}
                    options={sizeOptions}
                  />
                  <p className="text-[13px] leading-5 text-steel">
                    Canvas ratio applied before generation.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-micro-uppercase text-steel">
                    Quality
                  </Label>
                  <ImageSelect
                    ariaLabel="Select image quality"
                    value={quality}
                    onValueChange={setQuality}
                    options={qualityOptions}
                  />
                  <p className="text-[13px] leading-5 text-steel">
                    Auto balances cost and detail.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <Label
                    htmlFor="prompt"
                    className="text-micro-uppercase text-steel"
                  >
                    Prompt
                  </Label>
                  <span className="text-[11px] tabular-nums text-steel">
                    {prompt.length}
                    <span className="text-stone">/4000</span>
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the image you want to generate..."
                />
                <p className="text-[13px] leading-5 text-steel">
                  Describe subject, material, composition, lighting, and
                  constraints in one concise brief.
                </p>
              </div>

              <Button
                type="submit"
                className="group h-12 w-full"
                disabled={isGenerating || !prompt.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles className="transition-transform duration-500 ease-out group-hover:rotate-12" />
                )}
                {isGenerating ? "Generating..." : "Generate image"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card
          className="reveal flex flex-col overflow-hidden"
          style={{ ["--reveal-delay" as string]: "500" }}
        >
          <CardHeader>
            <CardTitle>
              Preview<span className="text-primary">.</span>
            </CardTitle>
            <CardDescription>
              Generated output appears here. If the model returns a revised
              prompt, it will be shown below the image.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-lg border border-dashed border-hairline-strong bg-surface-soft p-4">
              {!image ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
                >
                  <span className="block h-full w-1/3 bg-linear-to-r from-transparent via-primary/60 to-transparent animate-shimmer-line" />
                </span>
              ) : null}
              {image ? (
                <Image
                  src={image}
                  alt={revisedPrompt || prompt}
                  width={1536}
                  height={1536}
                  unoptimized
                  className="max-h-170 w-full rounded-lg object-contain shadow-mockup"
                />
              ) : (
                <div className="mx-auto max-w-sm text-center">
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card shadow-subtle">
                    <span className="absolute inset-0 -z-10 rounded-lg bg-[radial-gradient(circle,rgba(86,69,212,0.18),transparent_70%)] blur-xl" />
                    <ImageIcon className="h-7 w-7 text-stone animate-float-soft" />
                  </div>
                  <h2 className="mt-4 text-heading-5 text-ink">
                    Ready for a prompt
                  </h2>
                  <p className="mt-2 text-[13px] leading-6 text-steel">
                    Configure the request and generate an image. Missing
                    credentials are reported without exposing secrets.
                  </p>
                </div>
              )}
            </div>

            {image ? (
              <div className="mt-5 space-y-2 rounded-md border border-hairline-soft bg-secondary p-4 text-[13px]">
                <div>
                  <span className="font-semibold text-ink">Model: </span>
                  <span className="text-slate">{usedModel}</span>
                </div>
                {revisedPrompt ? (
                  <div>
                    <span className="font-semibold text-ink">Revised prompt: </span>
                    <span className="text-slate">{revisedPrompt}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

const tileToneMap = {
  lavender: { bg: "bg-tint-lavender", text: "text-brand-purple-800" },
  peach: { bg: "bg-tint-peach", text: "text-brand-orange-deep" },
  mint: { bg: "bg-tint-mint", text: "text-brand-green" },
  sky: { bg: "bg-tint-sky", text: "text-link-blue-pressed" },
} as const

type StatTileProps = {
  label: string
  value: string
  tone: keyof typeof tileToneMap
}

function StatTile({ label, value, tone }: StatTileProps) {
  const palette = tileToneMap[tone]
  return (
    <div
      className={`group rounded-md ${palette.bg} px-4 py-3 transition-transform duration-300 ease-out hover:-translate-y-0.5`}
    >
      <div className={`text-micro-uppercase ${palette.text} opacity-70`}>
        {label}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-charcoal">{value}</div>
    </div>
  )
}
