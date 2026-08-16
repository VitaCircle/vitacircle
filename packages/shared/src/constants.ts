export const VERTICALS = [
  "ux_ui",
  "graphic_design",
  "photography",
  "illustration",
  "music_audio",
  "film_motion",
  "fashion",
  "writing",
  "architecture",
] as const;

export type Vertical = (typeof VERTICALS)[number];

export const VERTICAL_LABELS: Record<Vertical, string> = {
  ux_ui: "UX / UI",
  graphic_design: "Graphic design",
  photography: "Photography",
  illustration: "Illustration",
  music_audio: "Music / Audio",
  film_motion: "Film / Motion",
  fashion: "Fashion",
  writing: "Writing / Journalism",
  architecture: "Architecture / Interior",
};

export const BLOCK_TYPES = [
  "hero",
  "about",
  "experience",
  "education",
  "skills",
  "project",
  "gallery",
  "audio",
  "video",
  "testimonials",
  "awards",
  "contact",
  "embed",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const PLANS = ["free", "pro", "studio"] as const;
export type PlanId = (typeof PLANS)[number];

export const ROLES = [
  "creator",
  "admin",
  "org_admin",
  "recruiter",
] as const;
export type UserRole = (typeof ROLES)[number];

export const PORTFOLIO_STATUSES = [
  "draft",
  "published",
  "unpublished",
  "archived",
] as const;
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const AI_RUBRIC_WEIGHTS = {
  relevance: 30,
  evidence: 25,
  craft: 20,
  completeness: 15,
  clarity: 10,
} as const;

export type RubricKey = keyof typeof AI_RUBRIC_WEIGHTS;

export const ALLOWED_IMAGE_MIME = ["image/png", "image/jpeg"] as const;
export const ALLOWED_AUDIO_MIME = ["audio/mpeg", "audio/mp3"] as const;
export const ALLOWED_VIDEO_MIME = ["video/mp4", "video/webm"] as const;
export const ALLOWED_IMPORT_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const SRS_MESSAGES = {
  invalidCredentials: "Invalid credentials. Please try again.",
  uploadSuccess: "File uploaded successfully.",
  exportSuccess: "Portfolio exported successfully.",
} as const;
