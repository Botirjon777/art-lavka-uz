/**
 * v2 design tokens.
 *
 * The brand colours are unchanged from v1 — they are lifted from the existing
 * components, not re-picked. What v2 changes is the *surface* palette: a white
 * page with light-grey media tiles instead of a flat #F5F5F5 everywhere.
 */
export const V2 = {
  // Brand (identical to v1)
  purple: "#8814B1",
  purpleDark: "#6E1090",
  purpleTint: "#F7F2FA",
  cyan: "#00C6F1",
  cyanInk: "#0F2031", // v1 pairs cyan fills with this, not white
  cyanTint: "#EAF9FE",

  // Surfaces
  page: "#FFFFFF",
  band: "#FAFAFB",
  tile: "#F4F4F6",
  line: "#ECECEF",
  border: "#E2E2E8",

  // Text
  ink: "#1A1A1A",
  body: "#333333",
  muted: "#9F9F9F",
  soft: "#6B6B75",

  // Status
  ok: "#1E9E5A",
  danger: "#E5484D",
} as const;

/** The 3D stage gradient used wherever a surface represents "live 3D". */
export const STAGE_3D =
  "linear-gradient(150deg, #EFE7F5 0%, #F4F4F6 46%, #E4F5FB 100%)";

/** Formats a UZS amount the way the rest of the app does. */
export function money(n: number): string {
  return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ");
}

/**
 * Aurora gradients for collection tiles — layered radial washes over a deep
 * base, anchored to the brand purple/cyan. Cheaper and more distinctive than a
 * cropped product photo, and they never fight the label sitting on top.
 */
export const COLLECTION_GRADIENTS: string[] = [
  // deep plum → magenta bloom
  "radial-gradient(120% 95% at 18% 8%, #C05CF0 0%, transparent 58%)," +
    "radial-gradient(110% 90% at 88% 30%, #7A1BB5 0%, transparent 55%)," +
    "linear-gradient(158deg, #4A0C6B 0%, #1E0730 100%)",
  // cyan lagoon
  "radial-gradient(115% 90% at 22% 12%, #6FE6FF 0%, transparent 55%)," +
    "radial-gradient(120% 95% at 85% 78%, #0B7FA6 0%, transparent 60%)," +
    "linear-gradient(160deg, #0E4F61 0%, #08222C 100%)",
  // violet dusk
  "radial-gradient(120% 90% at 80% 12%, #8F7BFF 0%, transparent 58%)," +
    "radial-gradient(110% 95% at 12% 82%, #3A1E9E 0%, transparent 62%)," +
    "linear-gradient(150deg, #241B5E 0%, #0D0A24 100%)",
  // ember (warm counterpoint)
  "radial-gradient(120% 92% at 15% 14%, #FF9A6B 0%, transparent 55%)," +
    "radial-gradient(115% 95% at 88% 72%, #C0334F 0%, transparent 58%)," +
    "linear-gradient(155deg, #7A2140 0%, #2C0C1B 100%)",
  // teal moss
  "radial-gradient(118% 92% at 78% 16%, #7BE8C4 0%, transparent 56%)," +
    "radial-gradient(112% 90% at 14% 80%, #157F73 0%, transparent 60%)," +
    "linear-gradient(162deg, #12463F 0%, #071C19 100%)",
  // ink + purple rim
  "radial-gradient(120% 88% at 86% 10%, #A855F7 0%, transparent 52%)," +
    "radial-gradient(110% 95% at 10% 88%, #2B2B6B 0%, transparent 58%)," +
    "linear-gradient(150deg, #1C1C24 0%, #08080C 100%)",
];

/** Fine film grain, layered over a gradient to stop it looking flat. */
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/**
 * Hero backdrop blobs. Softer than the collection tiles — garments sit on top,
 * so these stay light enough for a black shirt and rich enough for a white one.
 */
export const HERO_BLOBS: string[] = [
  // lilac wash, deep enough to hold a white garment
  "radial-gradient(85% 85% at 30% 25%, #F0D9FF 0%, transparent 62%)," +
    "radial-gradient(95% 90% at 75% 80%, #C79AEA 0%, transparent 66%)," +
    "linear-gradient(150deg, #E3C8F6 0%, #CBA5EC 100%)",
  // the dominant purple bloom (behind the centre shirt)
  "radial-gradient(80% 80% at 28% 20%, #C462F5 0%, transparent 58%)," +
    "radial-gradient(90% 85% at 82% 82%, #5C0B84 0%, transparent 62%)," +
    "linear-gradient(155deg, #9A1AC7 0%, #6A0E96 100%)",
  // cool aqua wash (behind the right shirt)
  "radial-gradient(85% 85% at 70% 22%, #EAFBFF 0%, transparent 60%)," +
    "radial-gradient(95% 92% at 25% 82%, #A6E4F5 0%, transparent 64%)," +
    "linear-gradient(160deg, #D9F3FC 0%, #BFE9F8 100%)",
];
