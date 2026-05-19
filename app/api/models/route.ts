export const runtime = "nodejs"

type ModelsRequest = {
  apiKey?: unknown
  baseURL?: unknown
}

type ModelItem = {
  id?: unknown
}

type ModelsResponse = {
  data?: unknown
  error?: unknown
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getModelsURL(baseURL: string) {
  const url = baseURL ? new URL(baseURL) : new URL("https://api.openai.com/v1")
  const pathname = url.pathname.replace(/\/+$/, "")
  url.pathname = pathname.endsWith("/models") ? pathname : `${pathname}/models`
  url.search = ""
  url.hash = ""
  return url
}

export async function POST(request: Request) {
  let body: ModelsRequest

  try {
    body = (await request.json()) as ModelsRequest
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const apiKey = getString(body.apiKey)
  const baseURL = getString(body.baseURL)

  if (!apiKey) {
    return Response.json({ error: "Enter your API key in provider settings." }, { status: 400 })
  }

  let modelsURL: URL
  try {
    modelsURL = getModelsURL(baseURL)
  } catch {
    return Response.json({ error: "Base URL must be a valid URL." }, { status: 400 })
  }

  try {
    const response = await fetch(modelsURL, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const data = (await response.json()) as ModelsResponse

    if (!response.ok) {
      const message =
        typeof data.error === "string"
          ? data.error
          : `Failed to load models with status ${response.status}.`
      return Response.json({ error: message }, { status: response.status })
    }

    const modelsData = Array.isArray(data.data) ? data.data : []
    const models = Array.from(
      new Set(
        modelsData
          .map((model) => getString((model as ModelItem).id))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b))

    return Response.json({ models })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models."

    console.error("[/api/models] failed to load models", {
      message,
      hasCustomBaseURL: Boolean(baseURL),
    })

    return Response.json({ error: message || "Failed to load models." }, { status: 502 })
  }
}
