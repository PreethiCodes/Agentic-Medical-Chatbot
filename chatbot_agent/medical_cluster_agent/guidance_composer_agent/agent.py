from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="guidance_composer_agent",
    model="gemini-2.5-flash",
    description=(
        """ ... your full prompt here ... """
    )
)


def run_guidance_composer(input_payload):
    """
    input_payload must include:
        - final_diagnosis
        - red_flags
        - knowledge_context
        - confidence_score
    """

    # Run model
    response = root_agent.run(input_payload)

    # Parse JSON output
    try:
        output = json.loads(response)
    except Exception:
        return response

    # Extract values for logging
    red_flags = input_payload.get("red_flags", [])
    condition_summary = output.get("condition_summary", "")
    emergency_signs = output.get("emergency_warning_signs", [])
    confidence = input_payload.get("confidence_score", 0.0)

    # Log expressible AI trace
    TraceManager.safety_trace(
        query=str(input_payload),
        violation=(len(red_flags) > 0),
        policy="Emergency flag policy / Safe guidance policy",
        action=condition_summary,
        confidence=confidence
    )

    return output
