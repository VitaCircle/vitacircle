import { z } from "zod";
import { BLOCK_TYPES, VERTICALS } from "./constants";

export const mediaRefSchema = z.object({
  assetId: z.string(),
  alt: z.string().max(240).optional(),
  caption: z.string().max(500).optional(),
});

export const heroBlockData = z.object({
  name: z.string().max(120).default(""),
  headline: z.string().max(200).default(""),
  location: z.string().max(120).optional(),
  availability: z.string().max(120).optional(),
  portraitAssetId: z.string().optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: z.string().max(500).optional(),
});

export const aboutBlockData = z.object({
  body: z.string().max(4000).default(""),
});

export const experienceItem = z.object({
  id: z.string(),
  org: z.string().max(160).default(""),
  role: z.string().max(160).default(""),
  start: z.string().max(40).default(""),
  end: z.string().max(40).optional(),
  summary: z.string().max(2000).default(""),
});

export const experienceBlockData = z.object({
  items: z.array(experienceItem).default([]),
});

export const educationItem = z.object({
  id: z.string(),
  school: z.string().max(160).default(""),
  credential: z.string().max(160).default(""),
  year: z.string().max(40).optional(),
});

export const educationBlockData = z.object({
  items: z.array(educationItem).default([]),
});

export const skillsBlockData = z.object({
  items: z.array(z.string().max(80)).default([]),
});

export const projectBlockData = z.object({
  title: z.string().max(160).default(""),
  problem: z.string().max(2000).default(""),
  role: z.string().max(200).default(""),
  outcome: z.string().max(2000).default(""),
  links: z.array(z.string().url().or(z.string().max(500))).default([]),
  media: z.array(mediaRefSchema).default([]),
});

export const galleryBlockData = z.object({
  media: z.array(mediaRefSchema).default([]),
});

export const audioBlockData = z.object({
  title: z.string().max(160).default(""),
  assetId: z.string().optional(),
  captions: z.string().max(1000).optional(),
});

export const videoBlockData = z.object({
  title: z.string().max(160).default(""),
  assetId: z.string().optional(),
  captions: z.string().max(1000).optional(),
});

export const testimonialItem = z.object({
  id: z.string(),
  quote: z.string().max(800).default(""),
  name: z.string().max(120).default(""),
  title: z.string().max(160).optional(),
});

export const testimonialsBlockData = z.object({
  items: z.array(testimonialItem).default([]),
});

export const awardItem = z.object({
  id: z.string(),
  title: z.string().max(160).default(""),
  issuer: z.string().max(160).optional(),
  year: z.string().max(40).optional(),
});

export const awardsBlockData = z.object({
  items: z.array(awardItem).default([]),
});

export const contactBlockData = z.object({
  email: z.string().max(200).optional(),
  website: z.string().max(300).optional(),
  linkedin: z.string().max(300).optional(),
  instagram: z.string().max(300).optional(),
  phone: z.string().max(40).optional(),
});

export const embedBlockData = z.object({
  url: z.string().max(500).default(""),
  title: z.string().max(160).optional(),
});

export const blockDataByType = {
  hero: heroBlockData,
  about: aboutBlockData,
  experience: experienceBlockData,
  education: educationBlockData,
  skills: skillsBlockData,
  project: projectBlockData,
  gallery: galleryBlockData,
  audio: audioBlockData,
  video: videoBlockData,
  testimonials: testimonialsBlockData,
  awards: awardsBlockData,
  contact: contactBlockData,
  embed: embedBlockData,
} as const;

export const blockSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  data: z.record(z.unknown()),
});

export type Block = z.infer<typeof blockSchema>;

export const themeTokensSchema = z.object({
  fontDisplay: z.string().default("Fraunces"),
  fontBody: z.string().default("Source Sans 3"),
  colorBg: z.string().default("#FAF8F5"),
  colorInk: z.string().default("#1A1916"),
  colorAccent: z.string().default("#C45C26"),
  colorMuted: z.string().default("#6B6560"),
  radius: z.enum(["none", "sm", "md"]).default("sm"),
  density: z.enum(["compact", "regular", "airy"]).default("regular"),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const draftTreeSchema = z.object({
  schemaVersion: z.literal(1),
  blocks: z.array(blockSchema),
  theme: themeTokensSchema.optional(),
});

export type DraftTree = z.infer<typeof draftTreeSchema>;

export const publishedSnapshotSchema = draftTreeSchema.extend({
  publishedAt: z.string(),
  title: z.string(),
  vertical: z.enum(VERTICALS),
  ownerUsername: z.string(),
  slug: z.string(),
});

export type PublishedSnapshot = z.infer<typeof publishedSnapshotSchema>;
