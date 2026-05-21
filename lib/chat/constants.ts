export const providerSettingsStorageKey = "imgen.providerSettings";
export const defaultImageModel = "gpt-image-2";

export type OptionItem = {
  label: string;
  value: string;
  meta?: string;
};

export const sizeOptions: OptionItem[] = [
  { label: "Square", meta: "1024 × 1024", value: "1024x1024" },
  { label: "Portrait", meta: "1024 × 1536", value: "1024x1536" },
  { label: "Landscape", meta: "1536 × 1024", value: "1536x1024" },
  { label: "Auto", meta: "Model picks", value: "auto" },
];

export const qualityOptions: OptionItem[] = [
  { label: "Auto", value: "auto" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const modelOptions: OptionItem[] = [
  { label: "gpt-image-1", value: "gpt-image-1" },
  { label: "gpt-image-2", value: "gpt-image-2" },
  { label: "dall-e-3", value: "dall-e-3" },
];

export const samplePrompts = [
  "Risograph illustration of a quiet bookstore on a rainy afternoon, limited palette of coral and indigo, grainy texture",
  "Studio photograph of a ceramic pour-over coffee setup, morning light, shallow depth of field, beige linen backdrop",
  "Portrait of a thoughtful young woman in a tailored wool coat, soft overcast light, 35mm film grain, muted earth tones",
  "Misty alpine valley at golden hour, layered ridgelines, cinematic wide shot, low contrast, painterly atmosphere",
  "Floating crystalline sculpture in zero gravity, refracted rainbow light, dark obsidian backdrop, ultra-detailed concept art",
  "Risograph illustration of a quiet bookstore on a rainy afternoon, limited palette of coral and indigo, grainy texture",
  "Sun-drenched mid-century living room with a Noguchi lamp and travertine coffee table, architectural digest editorial",
  "Macro shot of dew on a cobalt-blue dahlia, hyperreal detail, soft natural light, neutral cream background",
  "Cyberpunk night market in rain-slicked Tokyo alley, neon signage reflected in puddles, anamorphic lens flare",
  "Children's storybook illustration of a tiny astronaut planting flowers on a pastel-colored moon, gouache style",
  "A warm minimal desk workspace for AI image generation, Notion-inspired product design, soft surfaces, editorial lighting"
  
];

export function pickRandomPrompt(currentPrompt: string): string {
  const candidates = samplePrompts.filter((sample) => sample !== currentPrompt);
  const pool = candidates.length > 0 ? candidates : samplePrompts;
  return pool[Math.floor(Math.random() * pool.length)];
}
