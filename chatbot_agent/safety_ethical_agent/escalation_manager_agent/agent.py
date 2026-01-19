"""
Escalation Manager Agent for Medical Chatbot with Expressible AI
"""
from google.adk.agents.llm_agent import LlmAgent
from pydantic import BaseModel
from explainability.expressible_ai.trace_manager import TraceManager

# Read prompt files
def load_prompt(filename):
    try:
        with open(f"prompts/{filename}", "r") as f:
            return f.read()
    except FileNotFoundError:
        return ""

class EscalationOutput(BaseModel):
    escalation_level: str
    action: str
    message_type: str
    final_user_message: str

root_agent = LlmAgent(
    name="escalation_manager_agent",
    model="gemini-2.5-flash-lite",
    description="""
    Determines the correct medical escalation level based on risk, safety, confidence, and crisis signals.
    """,
    instruction=load_prompt("system_prompt.txt"),
    output_schema=EscalationOutput
)

def run_escalation_manager(user_input, risk_assessment=None):
    response = root_agent.run(user_input)

    # Optional: log risk trace
    if risk_assessment:
        TraceManager.risk_trace(
            risk_level=risk_assessment.get("risk_level", "low"),
            factors=[risk_assessment.get("summary", "")],
            patterns=[user_input],
            segments=[user_input],
            confidence=risk_assessment.get("confidence", 0.5)
        )

    return response
