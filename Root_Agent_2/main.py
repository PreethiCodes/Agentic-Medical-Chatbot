"""
Root agent entry point for ADK Web
Run this with: adk run main.py
"""

from google.adk.agents import Agent, InvocationContext
from emotion_detection_agent.agent import emotion_detector_agent

# Create root orchestrator agent
root_agent = Agent(
    name="medical_chatbot_root",
    description="Medical Agentic AI Chatbot - Root Orchestrator",
    sub_agents=[emotion_detector_agent]
)

if __name__ == "__main__":
    print("Medical Agentic AI Chatbot - Ready to run in ADK Web")
    print(f"Root Agent: {root_agent.name}")
    print(f"Sub-agents: {[agent.name for agent in root_agent.sub_agents]}")
