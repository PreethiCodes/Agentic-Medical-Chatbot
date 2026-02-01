from google.adk.agents import LlmAgent
from .tools import get_user_address

root_agent = LlmAgent(
    name="auto_location",
    model="gemini-2.0-flash",
    description="Agent that determines user location and shows nearby hospitals",
    instruction="""
You are a location assistant.

When the user asks things like:
- "show hospitals near me"
- "find hospitals nearby"
- "hospitals around me"

Main thing to be done is if the user has any symptoms the show the nearby best hospital for curing that symptom alond with helpline number of that hospital.

Immediately call the tool to fetch their location automatically
and return nearby hospitals as a human-readable result.

If location fetching fails, then ask the user to type their city or area.
""",
    tools=[get_user_address],
)