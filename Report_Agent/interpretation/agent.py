"""
Person-1 Interpretation Agent (Google ADK)
"""

from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from .interpret_report import interpret_document


# ADK root_agent
root_agent = LlmAgent(
    name="person1_interpretation_agent",
    model="gemini-2.5-flash",
    description="Medical report interpretation agent",
    instruction="""
You interpret medical report text (lab, radiology, or clinical notes).
You output structured JSON including:
- report_type
- key_findings
- abnormalities
- risk_level
- short_summary
If the user sends empty text, politely ask for report text.
""",
)


# Entry point function for the interpreter
async def interpret(input_text: str):
    """
    Entry point function for interpreting medical reports.
    
    Args:
        input_text: The medical report text to interpret
        
    Returns:
        Dictionary with interpretation results
    """
    input_text = input_text.strip()
    if not input_text:
        return {"message": "Please paste a medical report text for interpretation."}

    # Call the interpretation pipeline
    return interpret_document(input_text)


__all__ = ["root_agent", "interpret"]

