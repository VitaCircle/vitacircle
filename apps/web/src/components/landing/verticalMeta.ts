import type { Vertical } from "@vitacircle/shared";

export type BentoSize = "featured" | "wide" | "tall" | "default";

export type VerticalMetaItem = {
  vertical: Vertical;
  tagline: string;
  blocks: string[];
  image?: string;
  bentoSize: BentoSize;
  accent?: string;
};

export const VERTICAL_META: VerticalMetaItem[] = [
  {
    vertical: "ux_ui",
    tagline: "Case studies with problem, role, and outcome blocks.",
    blocks: ["Project", "Hero", "Skills"],
    image: "/computer-bg1.jpg",
    bentoSize: "featured",
  },
  {
    vertical: "graphic_design",
    tagline: "Bold visual identity and project grids.",
    blocks: ["Gallery", "Project", "About"],
    bentoSize: "default",
    accent: "linear-gradient(135deg, #2B6CB0, #5B8DEF)",
  },
  {
    vertical: "photography",
    tagline: "Full-bleed galleries recruiters can scroll.",
    blocks: ["Gallery", "Project", "Contact"],
    image: "/4291.jpg",
    bentoSize: "default",
  },
  {
    vertical: "music_audio",
    tagline: "Embed reels and audio players inline.",
    blocks: ["Audio", "Project", "Hero"],
    bentoSize: "default",
    accent: "linear-gradient(135deg, #5B3A8C, #3AAFA9)",
  },
  {
    vertical: "film_motion",
    tagline: "Show motion work with video blocks.",
    blocks: ["Video", "Gallery", "Project"],
    image: "/student-with-bag-bg.jpg",
    bentoSize: "default",
  },
  {
    vertical: "illustration",
    tagline: "Portfolio layouts built for visual storytelling.",
    blocks: ["Gallery", "Project", "Awards"],
    image: "/student-with-books-bg.jpg",
    bentoSize: "wide",
  },
  {
    vertical: "fashion",
    tagline: "Lookbook-style layouts for collections.",
    blocks: ["Gallery", "Project", "Experience"],
    bentoSize: "wide",
    accent: "linear-gradient(135deg, #9F1239, #C45C26)",
  },
  {
    vertical: "writing",
    tagline: "Masthead templates for journalists and editors.",
    blocks: ["Project", "Experience", "Embed"],
    image: "/student-researching-bg.jpg",
    bentoSize: "default",
  },
  {
    vertical: "architecture",
    tagline: "Plans, awards, and structured project narratives.",
    blocks: ["Gallery", "Awards", "Project"],
    image: "/computer-bg1.jpg",
    bentoSize: "default",
  },
];
