import OpenAI from "openai"

export const runtime = "nodejs"

type GenerateRequest = {
  prompt?: unknown
  model?: unknown
  size?: unknown
  quality?: unknown
}

const sizes = new Set(["1024x1024", "1024x1536", "1536x1024", "auto"])
const qualities = new Set(["auto", "low", "medium", "high"])

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Missing OPENAI_API_KEY. Add it to .env.local before generating images." },
      { status: 500 },
    )
  }

  let body: GenerateRequest

  try {
    body = (await request.json()) as GenerateRequest
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const prompt = getString(body.prompt)
  const model = getString(body.model) || process.env.IMAGE_MODEL || "gpt-image-1"
  const size = getString(body.size) || "1024x1024"
  const quality = getString(body.quality) || "auto"

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
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
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

    return Response.json({
      image: b64 ? `data:image/png;base64,${b64}` : url,
      model,
      revisedPrompt: image?.revised_prompt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed."

    return Response.json(
      { error: message || "Image generation failed. Try again later." },
      { status: 502 },
    )
  }
}
