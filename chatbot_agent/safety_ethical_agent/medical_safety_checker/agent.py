"""
Medical Safety Checker Agent with Expressible AI
"""
from google.adk.agents.llm_agent import LlmAgent
from pydantic import BaseModel
from typing import List
from explainability.expressible_ai.trace_manager import TraceManager

def load_prompt(filename):
    try:
        with open(f"prompts/{filename}", "r") as f:
            return f.read()
    except FileNotFoundError:
        return ""

class Issue(BaseModel):
    category: str
    evidence: str
    severity: int

class MedicalSafetyOutput(BaseModel):
    safety_flag: str
    issues_detected: List[Issue]
    explanation: str
    recommended_actions: List[str]
    is_safe_to_answer: bool
    unsafe_reason: str

root_agent = LlmAgent(
    name="medical_safety_checker",
    model="gemini-2.5-flash-lite",
    description="Detects unsafe or harmful medical content.",
    instruction=load_prompt("system_prompt.txt"),
    output_schema=MedicalSafetyOutput
)

def run_medical_safety_checker(user_input):
    response = root_agent.run(user_input)

    # Log safety trace
    TraceManager.safety_trace(
        query=user_input,
        violation="UNSAFE" if "UNSAFE" in response else "SAFE",
        policy="Medical Safety Policy",
        action="Escalate / Block / Warn" if "UNSAFE" in response else "Allow",
        confidence=1.0
    )

    return response
