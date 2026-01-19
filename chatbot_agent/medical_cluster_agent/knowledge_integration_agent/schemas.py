from pydantic import BaseModel
from typing import List


class EvidenceDoc(BaseModel):
    title: str
    content: str
    source: str = "local"


class KnowledgeResponse(BaseModel):
    query: str
    evidence: List[EvidenceDoc]
