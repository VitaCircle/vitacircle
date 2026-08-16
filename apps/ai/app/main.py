from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import RewriteRequest, ScoreRequest, TailorRequest
from app import scoring

app = FastAPI(title="VitaCircle AI", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "vitacircle-ai"}


@app.post("/v1/score")
async def score(req: ScoreRequest):
    return await scoring.score(req.draft, req.targetRole, req.jobDescription)


@app.post("/v1/tailor")
async def tailor(req: TailorRequest):
    return await scoring.tailor(req.draft, req.jobDescription, req.targetRole)


@app.post("/v1/rewrite")
async def rewrite(req: RewriteRequest):
    text = req.text.strip()
    if "short" in req.instruction.lower():
        parts = text.split(". ")
        text = ". ".join(parts[:2])
    return {"text": text, "model": "heuristic-v1"}
