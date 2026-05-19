import type { ChatMessage } from "./types"

export type TurnGroupKey = "today" | "yesterday" | "last7" | "older"

export type TurnGroup = {
  key: TurnGroupKey
  label: string
  turns: ChatMessage[]
}

const DAY_MS = 86_400_000

export function groupUserTurnsByTime(
  messages: ChatMessage[],
  now: number = Date.now(),
): TurnGroup[] {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const todayStart = start.getTime()
  const yesterdayStart = todayStart - DAY_MS
  const last7Start = todayStart - 7 * DAY_MS

  const today: ChatMessage[] = []
  const yesterday: ChatMessage[] = []
  const last7: ChatMessage[] = []
  const older: ChatMessage[] = []

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i]
    if (msg.role !== "user") continue
    if (msg.createdAt >= todayStart) today.push(msg)
    else if (msg.createdAt >= yesterdayStart) yesterday.push(msg)
    else if (msg.createdAt >= last7Start) last7.push(msg)
    else older.push(msg)
  }

  const groups: TurnGroup[] = [
    { key: "today", label: "Today", turns: today },
    { key: "yesterday", label: "Yesterday", turns: yesterday },
    { key: "last7", label: "Last 7 days", turns: last7 },
    { key: "older", label: "Older", turns: older },
  ]

  return groups.filter((group) => group.turns.length > 0)
}

export function summarizeTurn(turn: ChatMessage, maxLength = 60): string {
  const content = turn.content.trim().replace(/\s+/g, " ")
  if (content.length <= maxLength) return content
  return `${content.slice(0, maxLength - 1)}…`
}
