"use client"

import * as React from "react"
import { ImageIcon, Loader2, SlidersHorizontal, Sparkles } from "lucide-react"

import { ImageSelect } from "@/components/image-select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

const sizeOptions = [
  { label: "Square · 1024×1024", value: "1024x1024" },
  { label: "Portrait · 1024×1536", value: "1024x1536" },
  { label: "Landscape · 1536×1024", value: "1536x1024" },
  { label: "Auto", value: "auto" },
]

const qualityOptions = [
  { label: "Auto", value: "auto" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
]

type GenerateResponse = {
  image?: string
  model?: string
  revisedPrompt?: string
  error?: string
}

export default function Home() {
  const [model, setModel] = React.useState("gpt-image-1")
  const [prompt, setPrompt] = React.useState(
    "A warm minimal desk workspace for AI image generation, Notion-inspired product design, soft surfaces, editorial lighting",
  )
  const [size, setSize] = React.useState("1024x1024")
  const [quality, setQuality] = React.useState("auto")
  const [image, setImage] = React.useState("")
  const [usedModel, setUsedModel] = React.useState("")
  const [revisedPrompt, setRevisedPrompt] = React.useState("")
  const [error, setError] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setImage("")
    setRevisedPrompt("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, model, size, quality }),
      })
      const data = (await response.json()) as GenerateResponse

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed.")
      }

      setImage(data.image || "")
      setUsedModel(data.model || model)
      setRevisedPrompt(data.revisedPrompt || "")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image generation failed.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-8 sm:px-8 lg:px-10">
      <section className="grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Configurable image API
          </div>
          <h1 className="text-5xl font-bold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
            AI Image Workspace
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-muted-foreground sm:text-xl">
            Configure model, size, and quality in a warm minimal console, then
            generate images through a server-side OpenAI API route.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-card backdrop-blur">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">Model</div>
              <div className="mt-1 text-muted-foreground">Editable</div>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">Output</div>
              <div className="mt-1 text-muted-foreground">Base64/URL</div>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">API Key</div>
              <div className="mt-1 text-muted-foreground">Server only</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid flex-1 items-stretch gap-6 pb-6 lg:grid-cols-[440px_1fr]">
        <Card className="overflow-hidden bg-card/95">
          <CardHeader className="border-b border-border/70 bg-secondary/45 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Generate</CardTitle>
                <CardDescription className="mt-2 leading-6">
                  Keep provider credentials on the server. Override the image
                  model per request when needed.
                </CardDescription>
              </div>
              <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-border bg-secondary/35 p-3.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="model">Model</Label>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                      Request scope
                    </span>
                  </div>
                  <Input
                    id="model"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    placeholder="gpt-image-1 or gpt-image-2"
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Leave the field aligned with your provider model name. The
                    server falls back to IMAGE_MODEL.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-border bg-card p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <Label>Size</Label>
                  <ImageSelect
                    ariaLabel="Select image size"
                    value={size}
                    onValueChange={setSize}
                    options={sizeOptions}
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Choose the canvas ratio before generation.
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border bg-card p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <Label>Quality</Label>
                  <ImageSelect
                    ariaLabel="Select image quality"
                    value={quality}
                    onValueChange={setQuality}
                    options={qualityOptions}
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Auto lets the model balance cost and detail.
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border bg-card p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="flex items-end justify-between gap-3">
                  <Label htmlFor="prompt">Prompt</Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {prompt.length}/4000
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the image you want to generate..."
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Describe subject, material, composition, lighting, and any
                  constraints in one concise brief.
                </p>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Generation failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl"
                disabled={isGenerating || !prompt.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {isGenerating ? "Generating..." : "Generate image"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Generated output appears here. If the model returns a revised
              prompt, it will be shown below the image.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex min-h-130 flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/70 p-4">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={revisedPrompt || prompt}
                  className="max-h-170 w-full rounded-xl object-contain shadow-card"
                />
              ) : (
                <div className="mx-auto max-w-sm text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-sm">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-tight">
                    Ready for a prompt
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Configure the request and generate an image. Missing API
                    credentials are reported inline without exposing secrets.
                  </p>
                </div>
              )}
            </div>

            {image ? (
              <div className="mt-5 space-y-3 rounded-xl bg-secondary p-4 text-sm">
                <div>
                  <span className="font-semibold">Model: </span>
                  <span className="text-muted-foreground">{usedModel}</span>
                </div>
                {revisedPrompt ? (
                  <div>
                    <span className="font-semibold">Revised prompt: </span>
                    <span className="text-muted-foreground">
                      {revisedPrompt}
                    </span>
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
