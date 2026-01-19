"""
Risk Detection Agent with Expressible AI
"""
from google.adk.agents.llm_agent import LlmAgent
from pydantic import BaseModel
from .schemas import RiskAssessment, RiskSignal
from .rules import ESCALATION_LEVELS
from explainability.expressible_ai.trace_manager import TraceManager

def load_prompt(filename):
    try:
        with open(f"prompts/{filename}", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""

class RiskDetectionAgent:
    name = "risk_detection_agent"
    description = "Detects self-harm, abuse, crisis states, and medical emergencies."

    def analyze(self, text: str) -> RiskAssessment:
        signals = []
        lowered = text.lower()

        if any(k in lowered for k in ["kill myself", "suicide", "end my life", "want to die"]):
            signals.append(RiskSignal(category="self_harm", evidence=text, severity=9))

        if any(k in lowered for k in ["hurt me", "abuse", "he hits me", "she beats me"]):
            signals.append(RiskSignal(category="abuse", evidence=text, severity=7))

        if any(k in lowered for k in ["chest pain", "can't breathe", "collapsed", "unconscious"]):
            signals.append(RiskSignal(category="medical_emergency", evidence=text, severity=8))

        if not signals:
            risk_assessment = RiskAssessment(
                risk_level="none",
                summary="No risk indicators detected.",
                signals=[],
                requires_escalation=False,
            )
        else:
            max_severity = max(s.severity for s in signals)
            level = "critical" if max_severity >= 9 else "high" if max_severity >= 7 else "medium" if max_severity >= 4 else "low"
            risk_assessment = RiskAssessment(
                risk_level=level,
                summary=f"Detected {len(signals)} risk signal(s) requiring safety awareness.",
                signals=signals,
                requires_escalation=level in ESCALATION_LEVELS,
            )

        # Log risk trace
        TraceManager.risk_trace(
            risk_level=risk_assessment.risk_level,
            factors=[s.category for s in signals],
            patterns=[text],
            segments=[text],
            confidence=max([s.severity / 10.0 for s in signals], default=0.0)
        )

        return risk_assessment

root_agent = LlmAgent(
    name="risk_detection_agent",
    model="gemini-2.5-flash-lite",
    description="Identifies safety risks in user messages.",
    instruction=load_prompt("system_prompt.txt")
)
