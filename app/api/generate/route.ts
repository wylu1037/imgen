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
      { error: "缺少 OPENAI_API_KEY，请先在 .env.local 中配置。" },
      { status: 500 },
    )
  }

  let body: GenerateRequest

  try {
    body = (await request.json()) as GenerateRequest
  } catch {
    return Response.json({ error: "请求体必须是有效 JSON。" }, { status: 400 })
  }

  const prompt = getString(body.prompt)
  const model = getString(body.model) || process.env.IMAGE_MODEL || "gpt-image-1"
  const size = getString(body.size) || "1024x1024"
  const quality = getString(body.quality) || "auto"

  if (!prompt) {
    return Response.json({ error: "请输入图片描述。" }, { status: 400 })
  }

  if (prompt.length > 4000) {
    return Response.json({ error: "图片描述不能超过 4000 个字符。" }, { status: 400 })
  }

  if (!sizes.has(size)) {
    return Response.json({ error: "不支持的图片尺寸。" }, { status: 400 })
  }

  if (!qualities.has(quality)) {
    return Response.json({ error: "不支持的图片质量。" }, { status: 400 })
  }

  try {
    const client = new OpenAI()
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
      return Response.json({ error: "图片生成成功但没有返回可展示的图片。" }, { status: 502 })
    }

    return Response.json({
      image: b64 ? `data:image/png;base64,${b64}` : url,
      model,
      revisedPrompt: image?.revised_prompt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片生成失败。"

    return Response.json(
      { error: message || "图片生成失败，请稍后重试。" },
      { status: 502 },
    )
  }
}
