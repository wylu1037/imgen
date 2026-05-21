export const DEFAULT_TITLE_MAX_GRAPHEMES = 30;

export function generateTitleFromPrompt(
  prompt: string,
  max: number = DEFAULT_TITLE_MAX_GRAPHEMES,
): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled";

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const graphemes = Array.from(segmenter.segment(cleaned), (s) => s.segment);
    if (graphemes.length <= max) return cleaned;
    return `${graphemes.slice(0, max - 1).join("")}…`;
  }

  const codePoints = Array.from(cleaned);
  if (codePoints.length <= max) return cleaned;
  return `${codePoints.slice(0, max - 1).join("")}…`;
}
