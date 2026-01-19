from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="stress_anxiety_agent",
    model="gemini-2.5-flash-lite",
    description="""
You are the STRESS & ANXIETY SUPPORT AGENT.

Your role:
- Receive user messages.
- Optionally call sub-agents.
- Respond calmly and supportively.
- Keep replies short and grounding.
- Never overwhelm the user.
"""
)

def run_stress_anxiety_agent(user_input, detected_risk=None):
    """
    detected_risk: optional dict from emotion or crisis monitor agents
    Example:
    {
        "urgency": "medium",
        "factors": ["anxious", "seeking_help"],
        "confidence": 0.75
    }
    """
    response = root_agent.run(user_input)

    # Optional logging for transparency
    if detected_risk:
        TraceManager.risk_trace(
            risk_level=detected_risk.get("urgency", "low"),
            factors=detected_risk.get("factors", []),
            patterns=[user_input],
            segments=[user_input],
            confidence=detected_risk.get("confidence", 0.5)
        )

    return response
