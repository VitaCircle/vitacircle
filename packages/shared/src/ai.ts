import { z } from "zod";
import { AI_RUBRIC_WEIGHTS } from "./constants";

export const rubricScoresSchema = z.object({
  relevance: z.number().min(0).max(100),
  evidence: z.number().min(0).max(100),
  craft: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
});

export const suggestionSchema = z.object({
  blockId: z.string().optional(),
  field: z.string().optional(),
  current: z.string().optional(),
  proposed: z.string(),
  reason: z.string(),
});

export const aiScoreResponseSchema = z.object({
  score: z.number().min(0).max(100),
  rubric: rubricScoresSchema,
  critique: z.array(z.string()),
  suggestions: z.array(suggestionSchema),
  citedBlockIds: z.array(z.string()),
  model: z.string(),
  promptVersion: z.string(),
  usedLlm: z.boolean(),
});

export type AiScoreResponse = z.infer<typeof aiScoreResponseSchema>;

export const aiTailorResponseSchema = z.object({
  projectOrder: z.array(z.string()),
  suggestions: z.array(suggestionSchema),
  notes: z.array(z.string()),
  model: z.string(),
  promptVersion: z.string(),
});

export type AiTailorResponse = z.infer<typeof aiTailorResponseSchema>;

export function weightedScore(rubric: z.infer<typeof rubricScoresSchema>): number {
  const totalWeight = Object.values(AI_RUBRIC_WEIGHTS).reduce((a, b) => a + b, 0);
  const raw =
    (rubric.relevance * AI_RUBRIC_WEIGHTS.relevance +
      rubric.evidence * AI_RUBRIC_WEIGHTS.evidence +
      rubric.craft * AI_RUBRIC_WEIGHTS.craft +
      rubric.completeness * AI_RUBRIC_WEIGHTS.completeness +
      rubric.clarity * AI_RUBRIC_WEIGHTS.clarity) /
    totalWeight;
  return Math.round(raw);
}
