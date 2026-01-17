from pydantic import BaseModel
from typing import List

class ConditionInfo(BaseModel):
    name: str
    overview: str
    common_causes: List[str]
    risk_factors: List[str]
    recommended_tests: List[str]
    standard_treatment_principles: List[str]

class MedicalSource(BaseModel):
    source_name: str
    type: str  # guideline | textbook | trusted_site

class KnowledgeIntegrationOutput(BaseModel):
    conditions: List[ConditionInfo]
    medical_sources: List[MedicalSource]
