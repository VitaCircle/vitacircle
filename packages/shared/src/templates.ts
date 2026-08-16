import type { Block, DraftTree, ThemeTokens } from "./blocks";
import type { Vertical } from "./constants";

const theme = (accent: string): ThemeTokens => ({
  fontDisplay: "Fraunces",
  fontBody: "Source Sans 3",
  colorBg: "#FAF8F5",
  colorInk: "#1A1916",
  colorAccent: accent,
  colorMuted: "#6B6560",
  radius: "sm",
  density: "regular",
});

function id(prefix: string) {
  return `${prefix}-${prefix.length}`;
}

function blocksFor(vertical: Vertical): Block[] {
  const common: Block[] = [
    { id: id("hero"), type: "hero", data: { name: "", headline: "", location: "" } },
    { id: id("about"), type: "about", data: { body: "" } },
    { id: id("project"), type: "project", data: { title: "", problem: "", role: "", outcome: "", media: [], links: [] } },
    { id: id("experience"), type: "experience", data: { items: [] } },
    { id: id("education"), type: "education", data: { items: [] } },
    { id: id("skills"), type: "skills", data: { items: [] } },
    { id: id("contact"), type: "contact", data: {} },
  ];

  if (vertical === "photography" || vertical === "illustration" || vertical === "fashion") {
    common.splice(2, 0, { id: id("gallery"), type: "gallery", data: { media: [] } });
  }
  if (vertical === "music_audio") {
    common.splice(2, 0, { id: id("audio"), type: "audio", data: { title: "", captions: "" } });
  }
  if (vertical === "film_motion") {
    common.splice(2, 0, { id: id("video"), type: "video", data: { title: "", captions: "" } });
  }
  if (vertical === "ux_ui" || vertical === "architecture") {
    common.push({ id: id("awards"), type: "awards", data: { items: [] } });
  }
  return common;
}

export type TemplateDef = {
  id: string;
  name: string;
  vertical: Vertical;
  free: boolean;
  theme: ThemeTokens;
};

export const TEMPLATES: TemplateDef[] = [
  { id: "atelier-ux", name: "Atelier", vertical: "ux_ui", free: true, theme: theme("#C45C26") },
  { id: "grid-ux", name: "Signal Grid", vertical: "ux_ui", free: true, theme: theme("#1F4E5A") },
  { id: "folio-graphic", name: "Folio", vertical: "graphic_design", free: true, theme: theme("#B42318") },
  { id: "press-photo", name: "Press Sheet", vertical: "photography", free: true, theme: theme("#2C2A26") },
  { id: "reel-audio", name: "Listening Room", vertical: "music_audio", free: true, theme: theme("#5B3A8C") },
  { id: "frame-film", name: "Frame", vertical: "film_motion", free: false, theme: theme("#111111") },
  { id: "line-illustration", name: "Line Weight", vertical: "illustration", free: false, theme: theme("#D97706") },
  { id: "look-fashion", name: "Lookbook", vertical: "fashion", free: false, theme: theme("#9F1239") },
  { id: "masthead-writing", name: "Masthead", vertical: "writing", free: true, theme: theme("#1E3A5F") },
  { id: "plan-architecture", name: "Section Cut", vertical: "architecture", free: false, theme: theme("#3F6212") },
];

export function draftFromTemplate(templateId: string): DraftTree {
  const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
  return {
    schemaVersion: 1,
    blocks: blocksFor(t.vertical),
    theme: t.theme,
  };
}
