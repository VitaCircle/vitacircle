import type { Block, DraftTree, ThemeTokens } from "./blocks";
import type { BlockType, Vertical } from "./constants";

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

function templateId(prefix: string, index: number) {
  return `${prefix}-${index}`;
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

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Intro",
  about: "Career story",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  project: "Case study",
  gallery: "Gallery",
  audio: "Audio sample",
  video: "Video sample",
  testimonials: "Testimonials",
  awards: "Awards",
  contact: "Contact",
  embed: "External work",
};

export const CONTENT_PROMPTS: Record<BlockType, string> = {
  hero: "Lead with your name, target role, location, and one clear line about the work you want to be hired for.",
  about: "Write a focused story: what you make, who you make it for, your strongest proof, and what opportunity you want next.",
  experience: "List roles, internships, freelance work, volunteering, or student leadership with specific responsibilities and outcomes.",
  education: "Add school, certification, bootcamp, or training details that support your target role.",
  skills: "Choose practical skills a recruiter can match to the role: tools, methods, creative strengths, and collaboration skills.",
  project: "Use problem, role, and outcome. Make the reader understand why the work mattered and what you personally contributed.",
  gallery: "Upload only your strongest visuals. Add alt text and captions so the work is accessible and easy to understand.",
  audio: "Add one polished MP3 with a title and context for your contribution, tools, and creative direction.",
  video: "Add a reel or motion sample with a short note about your role, process, and final result.",
  testimonials: "Use short quotes from mentors, clients, teachers, teammates, or collaborators that prove reliability and craft.",
  awards: "Include awards, exhibitions, press, scholarships, certificates, or recognitions relevant to the role.",
  contact: "Make it easy to reach you: email, portfolio site, LinkedIn, Instagram, or phone if you want recruiters to call.",
  embed: "Link to credible external work such as Figma, Behance, GitHub, SoundCloud, Vimeo, or a published article.",
};

export const READINESS_REQUIREMENTS = [
  { id: "target-role", label: "Set a target role", hint: "This makes the resume, portfolio, and AI score more focused." },
  { id: "intro", label: "Complete your intro", hint: "Add your name and a sharp headline." },
  { id: "project", label: "Add at least one case study", hint: "Recruiters need proof of your process and outcome." },
  { id: "skills", label: "List core skills", hint: "Keep skills practical and matched to the role." },
  { id: "contact", label: "Add contact details", hint: "Make follow-up easy after publishing." },
  { id: "email", label: "Verify your email", hint: "Publishing requires a verified email address." },
] as const;

export const TEMPLATES: TemplateDef[] = [
  { id: "advanced-creative-suite", name: "Advanced Creative Suite", vertical: "ux_ui", free: true, theme: theme("#175C62") },
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

function advancedCreativeSuite(): DraftTree {
  return {
    schemaVersion: 1,
    theme: {
      ...theme("#175C62"),
      colorBg: "#F7FAF8",
      colorInk: "#111827",
      colorMuted: "#5C6670",
      density: "airy",
    },
    blocks: [
      {
        id: templateId("hero", 1),
        type: "hero",
        data: {
          name: "",
          headline: "Creative problem solver building thoughtful digital experiences.",
          location: "",
          availability: "Open to internships, junior roles, freelance projects, and collaborations",
          ctaLabel: "View featured work",
          ctaHref: "#projects",
        },
      },
      {
        id: templateId("about", 1),
        type: "about",
        data: {
          body:
            "Write a short career story here: what you make, who you make it for, and what kind of opportunity you want next. Keep it specific, evidence-led, and easy for a recruiter to scan.",
        },
      },
      {
        id: templateId("skills", 1),
        type: "skills",
        data: {
          items: ["Research", "Visual design", "Prototyping", "Storytelling", "Presentation", "Collaboration"],
        },
      },
      {
        id: templateId("project", 1),
        type: "project",
        data: {
          title: "Featured case study",
          problem: "Describe the audience, business, or creative problem you solved.",
          role: "Explain your role, tools, collaborators, and key decisions.",
          outcome: "Add measurable or observable results: shipped work, client feedback, portfolio impact, or learning.",
          media: [],
          links: [],
        },
      },
      {
        id: templateId("project", 2),
        type: "project",
        data: {
          title: "Second project",
          problem: "Show range with another project that supports your target role.",
          role: "Clarify what you owned and how you moved the work forward.",
          outcome: "Summarize why this work matters and what changed because of it.",
          media: [],
          links: [],
        },
      },
      { id: templateId("gallery", 1), type: "gallery", data: { media: [] } },
      {
        id: templateId("experience", 1),
        type: "experience",
        data: {
          items: [
            {
              id: templateId("experience-item", 1),
              org: "",
              role: "Creative role, internship, freelance work, or student leadership",
              start: "",
              end: "",
              summary: "Summarize responsibilities, creative contribution, and impact in two concise sentences.",
            },
          ],
        },
      },
      {
        id: templateId("testimonials", 1),
        type: "testimonials",
        data: {
          items: [
            {
              id: templateId("testimonial-item", 1),
              quote: "Add a short quote from a mentor, client, teacher, teammate, or collaborator.",
              name: "",
              title: "",
            },
          ],
        },
      },
      { id: templateId("awards", 1), type: "awards", data: { items: [] } },
      { id: templateId("education", 1), type: "education", data: { items: [] } },
      { id: templateId("contact", 1), type: "contact", data: { email: "", website: "", linkedin: "", instagram: "" } },
    ],
  };
}

export function draftFromTemplate(templateId: string): DraftTree {
  const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
  if (t.id === "advanced-creative-suite") return advancedCreativeSuite();
  return {
    schemaVersion: 1,
    blocks: blocksFor(t.vertical),
    theme: t.theme,
  };
}
