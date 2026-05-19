import OpenAI from "openai"

export const runtime = "nodejs"

type GenerateRequest = {
  prompt?: unknown
  model?: unknown
  size?: unknown
  quality?: unknown
  apiKey?: unknown
  baseURL?: unknown
}

const sizes = new Set(["1024x1024", "1024x1536", "1536x1024", "auto"])
const qualities = new Set(["auto", "low", "medium", "high"])

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  let body: GenerateRequest

  try {
    body = (await request.json()) as GenerateRequest
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const apiKey = getString(body.apiKey)
  const baseURL = getString(body.baseURL)
  const prompt = getString(body.prompt)
  const model = getString(body.model) || "gpt-image-2"
  const size = getString(body.size) || "1024x1024"
  const quality = getString(body.quality) || "auto"

  if (!apiKey) {
    return Response.json({ error: "Enter your API key in provider settings." }, { status: 400 })
  }

  if (baseURL) {
    try {
      new URL(baseURL)
    } catch {
      return Response.json({ error: "Base URL must be a valid URL." }, { status: 400 })
    }
  }

  if (!prompt) {
    return Response.json({ error: "Enter an image prompt." }, { status: 400 })
  }

  if (prompt.length > 4000) {
    return Response.json({ error: "Prompt must be 4000 characters or fewer." }, { status: 400 })
  }

  if (!sizes.has(size)) {
    return Response.json({ error: "Unsupported image size." }, { status: 400 })
  }

  if (!qualities.has(quality)) {
    return Response.json({ error: "Unsupported image quality." }, { status: 400 })
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
    const response = await client.images.generate({
      model,
      prompt,
      size: size as "1024x1024" | "1024x1536" | "1536x1024" | "auto",
      quality: quality as "auto" | "low" | "medium" | "high",
      n: 1,
    })

    const image = response.data?.[0]
    const b64 = image?.b64_json
    const url = image?.url

    if (!b64 && !url) {
      return Response.json(
        { error: "The image was generated, but the provider did not return a displayable asset." },
        { status: 502 },
      )
    }

    let dataUri: string
    if (b64) {
      dataUri = `data:image/png;base64,${b64}`
    } else {
      try {
        const upstream = await fetch(url as string)
        if (!upstream.ok) {
          throw new Error(`Upstream image fetch failed with status ${upstream.status}`)
        }
        const buf = await upstream.arrayBuffer()
        const encoded = Buffer.from(buf).toString("base64")
        const contentType = upstream.headers.get("content-type") || "image/png"
        dataUri = `data:${contentType};base64,${encoded}`
      } catch (fetchError) {
        const fetchMessage =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to materialize image URL."
        console.error("[/api/generate] failed to materialize image URL", {
          message: fetchMessage,
        })
        return Response.json(
          { error: "The provider returned a URL that could not be loaded." },
          { status: 502 },
        )
      }
    }

    return Response.json({
      image: dataUri,
      model,
      revisedPrompt: image?.revised_prompt,
    })
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error && Number.isInteger(Number(error.status))
        ? Number((error as { status: number }).status)
        : 502
    const message = error instanceof Error ? error.message : "Image generation failed."

    console.error("[/api/generate] image generation failed", {
      status,
      message,
      model,
      hasCustomBaseURL: Boolean(baseURL),
    })

    return Response.json(
      { error: message || "Image generation failed. Try again later." },
      { status: status >= 400 && status < 600 ? status : 502 },
    )
  }
}
