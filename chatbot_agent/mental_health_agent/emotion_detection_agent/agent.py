from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="emotion_detection_agent",
    model="gemini-2.5-flash",
    description=(
        """
You are the EMOTION DETECTOR AGENT.

Your job:
- Detect user's emotional state.
- Detect emotional intensity.
- Detect intent.
- Output ONLY JSON following the strict schema.
...
"""
    )
)

def run_emotion_detection(user_input):
    response = root_agent.run(user_input)

    try:
        output = json.loads(response)
        emotion = output.get("emotion", "unknown")
        confidence = output.get("confidence", 0.0)
        intensity = output.get("intensity", "unknown")
        intent = output.get("intent", "neutral")
    except Exception:
        return response

    # Log risk trace
    TraceManager.risk_trace(
        risk_level=intensity,
        factors=[emotion, intent],
        patterns=[user_input],
        segments=[user_input],
        confidence=confidence
    )

    return output
