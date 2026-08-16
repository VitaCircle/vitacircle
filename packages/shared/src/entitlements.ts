import type { PlanId } from "./constants";

export type Entitlements = {
  maxPortfolios: number;
  maxTemplates: number;
  storageBytes: number;
  aiScoresPerMonth: number;
  watermarkPdf: boolean;
  video: boolean;
  customDomain: boolean;
  customSlug: boolean;
  analytics: boolean;
  atsExport: boolean;
  versionHistory: boolean;
  jobTailor: boolean;
  unlimitedAi: boolean;
  branding: boolean;
  passwordLinks: boolean;
  collabSeats: number;
};

export const PLAN_ENTITLEMENTS: Record<PlanId, Entitlements> = {
  free: {
    maxPortfolios: 1,
    maxTemplates: 3,
    storageBytes: 500 * 1024 * 1024,
    aiScoresPerMonth: 3,
    watermarkPdf: true,
    video: false,
    customDomain: false,
    customSlug: false,
    analytics: false,
    atsExport: false,
    versionHistory: false,
    jobTailor: false,
    unlimitedAi: false,
    branding: true,
    passwordLinks: false,
    collabSeats: 0,
  },
  pro: {
    maxPortfolios: 100,
    maxTemplates: 99,
    storageBytes: 25 * 1024 * 1024 * 1024,
    aiScoresPerMonth: 10_000,
    watermarkPdf: false,
    video: true,
    customDomain: true,
    customSlug: true,
    analytics: true,
    atsExport: true,
    versionHistory: true,
    jobTailor: true,
    unlimitedAi: true,
    branding: false,
    passwordLinks: true,
    collabSeats: 3,
  },
  studio: {
    maxPortfolios: 10_000,
    maxTemplates: 99,
    storageBytes: 200 * 1024 * 1024 * 1024,
    aiScoresPerMonth: 50_000,
    watermarkPdf: false,
    video: true,
    customDomain: true,
    customSlug: true,
    analytics: true,
    atsExport: true,
    versionHistory: true,
    jobTailor: true,
    unlimitedAi: true,
    branding: false,
    passwordLinks: true,
    collabSeats: 50,
  },
};

export function entitlementsFor(plan: PlanId): Entitlements {
  return PLAN_ENTITLEMENTS[plan];
}
