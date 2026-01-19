from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="crisis_monitor_agent",
    model="gemini-2.5-flash",
    description=(
        """
You are the CRISIS MONITOR AGENT.

Your job:
- Detect if the user is in crisis.
- Identify crisis type (self_harm, panic_attack, severe_anxiety, emotional_breakdown).
- Assess urgency level.
- Output ONLY JSON following the strict schema below.
- Never ask questions.
- Never give long conversational replies.
- Never mix text with JSON.
...
"""
    )
)

def run_crisis_monitor(user_input):
    response = root_agent.run(user_input)

    try:
        output = json.loads(response)
        crisis_detected = output.get("crisis_detected", False)
        crisis_type = output.get("crisis_type", "none")
        trigger_keywords = output.get("trigger_keywords", [])
        urgency = output.get("urgency", "low")
        severity_score = output.get("severity_score", 0)
    except Exception:
        return response

    # Log risk trace
    TraceManager.risk_trace(
        risk_level=urgency,
        factors=[crisis_type],
        patterns=trigger_keywords,
        segments=[user_input],
        confidence=severity_score / 100.0
    )

    return output
