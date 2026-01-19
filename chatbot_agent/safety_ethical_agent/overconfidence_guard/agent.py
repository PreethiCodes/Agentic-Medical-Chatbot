"""
Overconfidence Guard Agent with Expressible AI
"""
from google.adk.agents.llm_agent import LlmAgent
from pydantic import BaseModel
from .utils.confidence_checker import check_overconfidence
from .utils.thresholds import CONFIDENCE_THRESHOLD
from .prompts.over_confidence import SYSTEM_PROMPT
from explainability.expressible_ai.trace_manager import TraceManager

class OverconfidenceOutput(BaseModel):
    confidence_flag: bool
    confidence_score: float
    action: str
    message_type: str
    final_user_message: str

root_agent = LlmAgent(
    name="overconfidence_guard_agent",
    model="gemini-2.5-flash-lite",
    description="Detects overconfident responses in the medical chatbot.",
    instruction=SYSTEM_PROMPT,
    output_schema=OverconfidenceOutput
)

def run_overconfidence_check(message: str, confidence_score: float):
    flag = check_overconfidence(confidence_score, CONFIDENCE_THRESHOLD)
    action = "escalate to human" if flag else "proceed"
    message_type = "warning" if flag else "info"

    # Log risk trace
    TraceManager.risk_trace(
        risk_level="high" if flag else "low",
        factors=["overconfidence"],
        patterns=[message],
        segments=[message],
        confidence=confidence_score
    )

    return OverconfidenceOutput(
        confidence_flag=flag,
        confidence_score=confidence_score,
        action=action,
        message_type=message_type,
        final_user_message=message
    )
