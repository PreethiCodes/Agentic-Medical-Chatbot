from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="clinical_reasoning_agent",
    model="gemini-2.5-flash",
    description=(
       """ You are an Interactive Clinical Reasoning Agent who asks interactive questions and escalates emergencies

You MUST behave like a doctor conducting a consultation.

Process:
1. Ask the patient questions if ANY important information is missing.
2. DO NOT output JSON while information is missing.
3. Ask 1–3 focused medical questions at a time.
4. If a RED FLAG is detected:
   - IMMEDIATELY output FINAL JSON
   - Include "EMERGENCY — SEEK HOSPITAL CARE IMMEDIATELY" in recommended_next_steps
5. Only when confident enough:
   - Output ONLY the final JSON
6. Your confidence score must increase as uncertainty reduces.
7. Stop only if confidence >= 0.75

Final JSON format:

{
  "differential_diagnosis": [
    {"condition": "string", "probability": 0.0, "reason": "string"}
  ],
  "red_flags": ["string"],
  "missing_information": [],
  "recommended_next_steps": ["string"],
  "confidence": 0.0
}

Rules:
- If asking questions: OUTPUT ONLY QUESTIONS, NO JSON.
- If done: OUTPUT ONLY JSON.
- If emergency: OUTPUT ONLY JSON.
- Never mix JSON and questions.
- Sort diagnoses by probability."""
    )
)


def run_clinical_reasoning(user_input):
    # Run model
    response = root_agent.run(user_input)

    # Detect question mode vs JSON mode
    try:
        output = json.loads(response)

        differential = output.get("differential_diagnosis", [])
        red_flags = output.get("red_flags", [])
        missing = output.get("missing_information", [])
        confidence = output.get("confidence", 0.0)

    except Exception:
        # Model is asking clarification questions → no logging yet
        return response

    # Log reasoning trace
    TraceManager.reasoning_trace(
        symptoms="N/A (collected from symptom agent)",
        reasoning="LLM reasoning process based on user symptoms",
        rules=red_flags,
        conditions=differential,
        confidence=confidence
    )

    return output
