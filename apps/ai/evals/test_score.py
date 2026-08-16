from app.schemas import Block, DraftTree
from app.scoring import heuristic_score


def test_heuristic_score_bounds():
    draft = DraftTree(
        blocks=[
            Block(id="h", type="hero", data={"name": "Maya Chen", "headline": "Product designer"}),
            Block(
                id="p",
                type="project",
                data={"title": "Checkout", "problem": "Drop-off", "role": "Lead", "outcome": "Raised conversion 12%"},
            ),
        ]
    )
    result = heuristic_score(draft, "Product designer", "Figma UX research")
    assert 0 <= result.score <= 100
    assert result.usedLlm is False
