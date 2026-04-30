"use client"

import * as React from "react"
import { ImageIcon, Loader2, Sparkles } from "lucide-react"

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
        throw new Error(data.error || "图片生成失败。")
      }

      setImage(data.image || "")
      setUsedModel(data.model || model)
      setRevisedPrompt(data.revisedPrompt || "")
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "图片生成失败。")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
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
            用一个温暖极简的控制台配置模型、尺寸和质量，通过服务端 API 安全调用 OpenAI 图片生成能力。
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-card backdrop-blur">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">Model</div>
              <div className="mt-1 text-muted-foreground">可切换</div>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">Output</div>
              <div className="mt-1 text-muted-foreground">Base64/URL</div>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <div className="font-bold">API Key</div>
              <div className="mt-1 text-muted-foreground">仅服务端</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid flex-1 gap-6 pb-10 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Generate</CardTitle>
            <CardDescription>
              默认模型可在 .env.local 的 IMAGE_MODEL 中配置，也可以在这里覆盖。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="gpt-image-1 或 gpt-image-2"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <ImageSelect
                    ariaLabel="Select image size"
                    value={size}
                    onValueChange={setSize}
                    options={sizeOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <ImageSelect
                    ariaLabel="Select image quality"
                    value={quality}
                    onValueChange={setQuality}
                    options={qualityOptions}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the image you want to generate..."
                />
                <p className="text-xs text-muted-foreground">
                  {prompt.length}/4000 characters
                </p>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>生成失败</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="w-full"
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

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              生成结果会展示在这里；如果模型返回 revised prompt，也会一并显示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/70 p-4">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={revisedPrompt || prompt}
                  className="max-h-[680px] w-full rounded-xl object-contain shadow-card"
                />
              ) : (
                <div className="mx-auto max-w-sm text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-sm">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-tight">等待生成</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    配置模型和提示词后点击生成。没有 API key 时会显示配置错误，不会暴露密钥。
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
                    <span className="text-muted-foreground">{revisedPrompt}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
