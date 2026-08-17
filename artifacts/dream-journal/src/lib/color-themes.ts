export const COLOR_THEMES = [
  {
    value: "cosmic-purple",
    label: "Cosmic Purple",
    description: "Deep violet and starlight",
    swatches: ["#8b5cf6", "#c084fc", "#0b0718"],
  },
  {
    value: "lushly-green",
    label: "Lushly Green",
    description: "Forest calm and fresh moss",
    swatches: ["#2f9e6f", "#78d6a7", "#07150f"],
  },
  {
    value: "hot-lava-red",
    label: "Hot Lava Red",
    description: "Ember glow and volcanic heat",
    swatches: ["#d9463e", "#ff806b", "#1c0706"],
  },
  {
    value: "pretty-orange",
    label: "Pretty Orange",
    description: "Sunset warmth and apricot light",
    swatches: ["#d97706", "#fbad55", "#1c1005"],
  },
  {
    value: "black-and-white",
    label: "Black & White",
    description: "Quiet contrast, no distractions",
    swatches: ["#111111", "#f4f4f4", "#050505"],
  },
  {
    value: "jolly-yellow",
    label: "Jolly Yellow",
    description: "Golden optimism and bright energy",
    swatches: ["#b88700", "#f6c945", "#171100"],
  },
  {
    value: "creamy-beige",
    label: "Creamy Beige",
    description: "Soft parchment and warm coffee",
    swatches: ["#96652d", "#d6ad73", "#19130c"],
  },
] as const;

export type ColorTheme = (typeof COLOR_THEMES)[number]["value"];

export function isColorTheme(value: string | null): value is ColorTheme {
  return COLOR_THEMES.some((theme) => theme.value === value);
}