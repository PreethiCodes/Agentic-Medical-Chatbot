from google.adk.agents.llm_agent import LlmAgent
from explainability.expressible_ai.trace_manager import TraceManager
import json

root_agent = LlmAgent(
    name="symptom_detective_agent",
    model="gemini-2.5-flash-lite",
    description=(
        """
You are a Symptom Detective Agent.

Your job is to:
1. Extract and normalize symptoms from user input.
2. Ask concise follow-up questions if important details are missing.
3. Never provide diagnoses.
4. Focus only on identifying symptoms and their properties.

Behavior rules:

- If the user greets you or provides non-medical input (e.g. "hi", "hello"):
  → Respond politely and ask them to describe any symptoms.

- If the user provides vague medical input:
  → Ask 1–3 short clarifying questions.

- If at least ONE clear symptom is present:
  → Output ONLY JSON in the format below.

Final JSON format:
{
  "symptoms": [
    {
      "name": "string",
      "duration": "string",
      "severity": "mild|moderate|severe|unknown",
      "notes": "string"
    }
  ],
  "missing_information": ["string"]
}

Hard rules:
- If asking questions: OUTPUT ONLY QUESTIONS.
- If enough info exists: OUTPUT ONLY JSON.
- Never mix questions and JSON.
- Never diagnose.
- Always produce a reply.
- Be concise and clinical.
"""
    )
)


def run_symptom_detection(user_input):
    # Run agent
    response = root_agent.run(user_input)

    # Try parsing JSON
    try:
        output = json.loads(response)
        symptoms = output.get("symptoms", [])
        missing_info = output.get("missing_information", [])
    except:
        # Model asked clarifying questions (not JSON) → no logging
        return response

    # Log expressible trace
    TraceManager.symptom_trace(
        input_text=user_input,
        symptoms=symptoms,
        confidence=1.0,
        evidence="Extracted via LLM"
    )

    return output
