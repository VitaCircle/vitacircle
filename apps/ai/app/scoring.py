from __future__ import annotations

import json
import logging
import re

from app.prompts.v1 import PROMPT_VERSION, SCORE_SYSTEM, TAILOR_SYSTEM
from app.providers.llm import get_provider, prompt_hash
from app.schemas import (
    DraftTree,
    Rubric,
    ScoreResponse,
    Suggestion,
    TailorResponse,
)

log = logging.getLogger("vitacircle.ai")

WEIGHTS = {"relevance": 30, "evidence": 25, "craft": 20, "completeness": 15, "clarity": 10}


def _weighted(r: Rubric) -> int:
    total = sum(WEIGHTS.values())
    raw = (
        r.relevance * WEIGHTS["relevance"]
        + r.evidence * WEIGHTS["evidence"]
        + r.craft * WEIGHTS["craft"]
        + r.completeness * WEIGHTS["completeness"]
        + r.clarity * WEIGHTS["clarity"]
    ) / total
    return int(round(raw))


def _blob(draft: DraftTree) -> str:
    return json.dumps([b.model_dump() for b in draft.blocks]).lower()


def heuristic_score(draft: DraftTree, target_role: str, job: str | None) -> ScoreResponse:
    blob = _blob(draft)
    filled = [b for b in draft.blocks if len(json.dumps(b.data)) > 20]
    completeness = min(100, round(len(filled) / max(len(draft.blocks), 1) * 100))
    words = [w for w in re.split(r"\W+", f"{target_role} {job or ''}".lower()) if len(w) > 3]
    hits = sum(1 for w in words if w in blob)
    relevance = min(100, round(hits / max(len(words), 1) * 120))
    has_media = any(b.data.get("media") or b.data.get("assetId") for b in draft.blocks)
    has_numbers = bool(re.search(r"\d+%|\d{2,}", blob))
    evidence = min(100, (55 if has_numbers else 25) + (30 if has_media else 0))
    craft = min(100, 40 + (35 if has_media else 0) + (15 if draft.theme else 0))
    clarity = 75 if len(blob) > 400 else 50 if len(blob) > 120 else 25
    rubric = Rubric(
        relevance=max(10, relevance),
        evidence=evidence,
        craft=craft,
        completeness=completeness,
        clarity=clarity,
    )
    critique: list[str] = []
    if completeness < 70:
        critique.append("Fill empty sections before you apply.")
    if not has_media:
        critique.append("Add images or audio so craft is visible.")
    if not has_numbers:
        critique.append("Add a measurable outcome to each project.")
    if not critique:
        critique.append("Strong baseline. Make each project headline a one-line problem statement.")
    project = next((b for b in draft.blocks if b.type == "project"), None)
    suggestions = []
    if project:
        suggestions.append(
            Suggestion(
                blockId=project.id,
                field="outcome",
                proposed="Name the audience and a real metric from this project.",
                reason="Evidence improves when outcomes are specific.",
            )
        )
    return ScoreResponse(
        score=_weighted(rubric),
        rubric=rubric,
        critique=critique,
        suggestions=suggestions,
        citedBlockIds=[b.id for b in filled],
        model="heuristic-v1",
        promptVersion=PROMPT_VERSION,
        usedLlm=False,
    )


async def score(draft: DraftTree, target_role: str, job: str | None) -> ScoreResponse:
    provider = get_provider()
    if not provider:
        return heuristic_score(draft, target_role, job)
    user = json.dumps({"draft": draft.model_dump(), "targetRole": target_role, "jobDescription": job})
    log.info("score prompt_hash=%s", prompt_hash(user))
    try:
        data = await provider.complete_json(SCORE_SYSTEM, user)
        rubric = Rubric(**data["rubric"])
        return ScoreResponse(
            score=_weighted(rubric),
            rubric=rubric,
            critique=data.get("critique", []),
            suggestions=[Suggestion(**s) for s in data.get("suggestions", [])],
            citedBlockIds=data.get("citedBlockIds", []),
            model="openai",
            promptVersion=PROMPT_VERSION,
            usedLlm=True,
        )
    except Exception:
        log.exception("llm score failed; falling back")
        return heuristic_score(draft, target_role, job)


def heuristic_tailor(draft: DraftTree, job: str) -> TailorResponse:
    words = [w for w in re.split(r"\W+", job.lower()) if len(w) > 4]
    projects = [b for b in draft.blocks if b.type == "project"]
    scored = sorted(
        projects,
        key=lambda p: sum(1 for w in words if w in json.dumps(p.data).lower()),
        reverse=True,
    )
    return TailorResponse(
        projectOrder=[p.id for p in scored],
        suggestions=[
            Suggestion(
                blockId=scored[0].id,
                field="role",
                proposed=f"Highlight overlap with: {', '.join(words[:6])}",
                reason="Match language from the posting without inventing facts.",
            )
        ]
        if scored
        else [],
        notes=["Accept only suggestions that are true of your work."],
        model="heuristic-v1",
        promptVersion="tailor-v1",
    )


async def tailor(draft: DraftTree, job: str, target_role: str | None) -> TailorResponse:
    provider = get_provider()
    if not provider:
        return heuristic_tailor(draft, job)
    try:
        data = await provider.complete_json(
            TAILOR_SYSTEM,
            json.dumps({"draft": draft.model_dump(), "jobDescription": job, "targetRole": target_role}),
        )
        return TailorResponse(
            projectOrder=data.get("projectOrder", []),
            suggestions=[Suggestion(**s) for s in data.get("suggestions", [])],
            notes=data.get("notes", []),
            model="openai",
            promptVersion="tailor-v1",
        )
    except Exception:
        return heuristic_tailor(draft, job)
