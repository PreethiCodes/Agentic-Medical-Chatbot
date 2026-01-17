import json
from .formatter import format_output
from .schemas import KnowledgeIntegrationOutput

class KnowledgeIntegrationAgent:
    def __init__(self, model):
        self.model = model

    def run(self, diagnoses: list) -> KnowledgeIntegrationOutput:
        prompt = self._build_prompt(diagnoses)
        response_text = self.model(prompt)
        parsed = self._parse_json(response_text)
        return format_output(parsed)

    def _build_prompt(self, diagnoses):
        return (
            "You are a verified medical knowledge agent.\n"
            "Expand each diagnosis into medically validated information.\n\n"
            f"Diagnoses: {diagnoses}\n"
            "Return JSON only."
        )

    def _parse_json(self, text):
        try:
            return json.loads(text)
        except Exception:
            return {"conditions": [], "medical_sources": []}
