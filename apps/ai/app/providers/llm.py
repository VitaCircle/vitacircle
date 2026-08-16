from __future__ import annotations

import hashlib
import os
from typing import Any, Protocol


class LlmProvider(Protocol):
    async def complete_json(self, system: str, user: str) -> dict[str, Any]: ...


class HeuristicProvider:
    async def complete_json(self, system: str, user: str) -> dict[str, Any]:
        raise NotImplementedError("heuristic path is handled in scoring.py")


class OpenAiProvider:
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.model = model

    async def complete_json(self, system: str, user: str) -> dict[str, Any]:
        import httpx

        async with httpx.AsyncClient(timeout=12) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "response_format": {"type": "json_object"},
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                },
            )
            res.raise_for_status()
            content = res.json()["choices"][0]["message"]["content"]
        import json

        return json.loads(content)


def prompt_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:12]


def get_provider() -> LlmProvider | None:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    return OpenAiProvider(key, os.getenv("AI_MODEL", "gpt-4o-mini"))
