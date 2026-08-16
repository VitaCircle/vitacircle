from typing import Any

from pydantic import BaseModel, Field


class Block(BaseModel):
    id: str
    type: str
    data: dict[str, Any] = Field(default_factory=dict)


class DraftTree(BaseModel):
    schemaVersion: int = 1
    blocks: list[Block]
    theme: dict[str, Any] | None = None


class ScoreRequest(BaseModel):
    draft: DraftTree
    targetRole: str
    jobDescription: str | None = None


class Suggestion(BaseModel):
    blockId: str | None = None
    field: str | None = None
    current: str | None = None
    proposed: str
    reason: str


class Rubric(BaseModel):
    relevance: float
    evidence: float
    craft: float
    completeness: float
    clarity: float


class ScoreResponse(BaseModel):
    score: int
    rubric: Rubric
    critique: list[str]
    suggestions: list[Suggestion]
    citedBlockIds: list[str]
    model: str
    promptVersion: str
    usedLlm: bool


class TailorRequest(BaseModel):
    draft: DraftTree
    jobDescription: str
    targetRole: str | None = None


class TailorResponse(BaseModel):
    projectOrder: list[str]
    suggestions: list[Suggestion]
    notes: list[str]
    model: str
    promptVersion: str


class RewriteRequest(BaseModel):
    text: str
    instruction: str
