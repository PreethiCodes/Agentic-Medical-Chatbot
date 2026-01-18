"""
Interpretation Pipeline for medical report text.
"""

from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from .utils.risk_classifier import classify_risk
from .utils.prompts.lab_report_prompt import lab_report_prompt
from .utils.prompts.radiology_report_prompt import radiology_report_prompt
from .utils.prompts.doctor_report_prompt import doctor_report_prompt


# LLM used for interpretation
interpretation_agent = LlmAgent(
    name="interpretation_llm_model",
    model="gemini-2.5-flash",
    description="LLM used for report interpretation",
    instruction="You interpret medical report text and provide structured analysis.",
)


def detect_report_type(text: str):
    t = text.lower()

    lab_keywords = ["hemoglobin", "wbc", "cbc", "platelet", "glucose", "serum"]
    radiology_keywords = ["x-ray", "ct", "mri", "imaging", "scan", "radiograph"]

    if any(k in t for k in lab_keywords):
        return "lab"
    if any(k in t for k in radiology_keywords):
        return "radiology"
    return "doctor"


def interpret_document(text: str):
    report_type = detect_report_type(text)

    # Select prompt
    if report_type == "lab":
        sys_prompt = lab_report_prompt
    elif report_type == "radiology":
        sys_prompt = radiology_report_prompt
    else:
        sys_prompt = doctor_report_prompt

    # Create runner only when needed (not at module import time)
    runner = Runner(
        agent=interpretation_agent,
        app_name="report_interpreter"
    )

    # Run model using runner
    response = runner.run(
        user_id="user1",
        session_id="session1",
        text=sys_prompt + "\n\nPlease interpret the following report:\n" + text
    )

    # Collect all content from the response
    summary_parts = []
    for event in response:
        if hasattr(event, 'content') and hasattr(event.content, 'parts'):
            for part in event.content.parts:
                if hasattr(part, 'text'):
                    summary_parts.append(part.text)
    
    summary = "".join(summary_parts).strip() if summary_parts else ""

    risk_level = classify_risk(summary)

    return {
        "report_type": report_type,
        "summary": summary,
        "risk_level": risk_level
    }


__all__ = ["interpret_document"]

