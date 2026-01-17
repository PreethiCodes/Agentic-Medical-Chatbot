from google.adk.agents.llm_agent import LlmAgent

stress_anxiety_agent = LlmAgent(
    name="stress_anxiety_agent",
    model="gemini-2.5-flash-lite",
    description="""
You are the STRESS & ANXIETY SUPPORT AGENT.

Your role:
- Receive user messages.
- Optionally call sub-agents (like emotion detection in the future).
- Respond calmly and supportively.
- Keep replies short and grounding.
- Never overwhelm the user.
"""
)

# Export for ADK Web
root_agent = stress_anxiety_agent
