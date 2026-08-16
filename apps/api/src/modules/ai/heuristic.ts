import type { AiScoreResponse, AiTailorResponse, DraftTree } from "@vitacircle/shared";
import { weightedScore } from "@vitacircle/shared";

function textOf(draft: DraftTree) {
  return JSON.stringify(draft.blocks);
}

function filledBlocks(draft: DraftTree) {
  return draft.blocks.filter((b) => JSON.stringify(b.data).replace(/[{}\[\]",:]/g, "").trim().length > 8);
}

export function heuristicScore(draft: DraftTree, targetRole: string, jobDescription?: string): AiScoreResponse {
  const filled = filledBlocks(draft);
  const completeness = Math.min(100, Math.round((filled.length / Math.max(draft.blocks.length, 1)) * 100));
  const blob = textOf(draft).toLowerCase();
  const roleWords = `${targetRole} ${jobDescription || ""}`.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const hits = roleWords.filter((w) => blob.includes(w)).length;
  const relevance = Math.min(100, Math.round((hits / Math.max(roleWords.length, 1)) * 120));
  const hasMedia = draft.blocks.some((b) => {
    const d = b.data as { media?: unknown[]; assetId?: string };
    return (d.media && d.media.length > 0) || !!d.assetId;
  });
  const hasNumbers = /\d+%|\d{2,}/.test(blob);
  const evidence = Math.min(100, (hasNumbers ? 55 : 25) + (hasMedia ? 30 : 0));
  const craft = Math.min(100, 40 + (hasMedia ? 35 : 0) + (draft.theme ? 15 : 0));
  const clarity = Math.min(100, blob.length > 400 ? 75 : blob.length > 120 ? 50 : 25);
  const rubric = {
    relevance: Math.max(10, relevance),
    evidence,
    craft,
    completeness,
    clarity,
  };
  const score = weightedScore(rubric);
  const critique: string[] = [];
  if (completeness < 70) critique.push("Several sections are still empty — complete About, at least one project, and Contact before applying.");
  if (!hasMedia) critique.push("Add images or audio so recruiters can judge craft, not only copy.");
  if (!hasNumbers) critique.push("Outcomes are vague. Add a measurable result to each project.");
  if (relevance < 50) critique.push(`Few terms from “${targetRole}” appear in your work. Reorder projects to match the posting.`);
  if (critique.length === 0) critique.push("Solid baseline. Tighten headlines so each project states the problem in one line.");
  const project = draft.blocks.find((b) => b.type === "project");
  const suggestions = project
    ? [
        {
          blockId: project.id,
          field: "outcome",
          proposed: "Shipped the work to [audience], resulting in [metric] — replace brackets with real numbers from this project.",
          reason: "Evidence score improves when outcomes are specific and attributed to your role.",
        },
      ]
    : [];
  return {
    score,
    rubric,
    critique,
    suggestions,
    citedBlockIds: filled.map((b) => b.id),
    model: "heuristic-v1",
    promptVersion: "rubric-v1",
    usedLlm: false,
  };
}

export function heuristicTailor(draft: DraftTree, jobDescription: string): AiTailorResponse {
  const words = jobDescription.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const projects = draft.blocks.filter((b) => b.type === "project");
  const scored = projects
    .map((p) => {
      const t = JSON.stringify(p.data).toLowerCase();
      const n = words.filter((w) => t.includes(w)).length;
      return { id: p.id, n };
    })
    .sort((a, b) => b.n - a.n);
  return {
    projectOrder: scored.map((s) => s.id),
    suggestions: projects.slice(0, 1).map((p) => ({
      blockId: p.id,
      field: "role",
      proposed: `Lead contributor aligned to: ${words.slice(0, 6).join(", ")}`,
      reason: "Surface the posting’s language in the role line without inventing employers.",
    })),
    notes: [
      "Suggestions are derived from keyword overlap with the job description. Accept only what is true of your work.",
      "Word export remains a linear mapping of sections — layout will be simpler than the live site.",
    ],
    model: "heuristic-v1",
    promptVersion: "tailor-v1",
  };
}

export function heuristicRewrite(text: string, instruction: string) {
  const trimmed = text.trim();
  if (instruction.toLowerCase().includes("short")) {
    return { text: trimmed.split(/(?<=\.)\s/).slice(0, 2).join(" "), model: "heuristic-v1" };
  }
  return { text: trimmed, model: "heuristic-v1" };
}
