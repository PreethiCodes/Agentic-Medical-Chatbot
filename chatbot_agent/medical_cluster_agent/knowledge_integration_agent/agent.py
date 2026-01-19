from google.adk.agents.llm_agent import LlmAgent
from .retriever import retrieve
from .schemas import KnowledgeResponse, EvidenceDoc
import json
from explainability.expressible_ai.trace_manager import TraceManager


def knowledge_tool(query: str) -> str:
    results = retrieve(query)

    response = {
        "query": query,
        "evidence": results
    }

    return json.dumps(response, indent=2)


root_agent = LlmAgent(
    name="knowledge_integration_agent",
    model="gemini-2.5-flash",
    description=(
        """Retrieves and integrates medical evidence from knowledge base
        You are a Knowledge Integration Agent which is used to retrieve and integrate medical evidence from knowledge base

Your job:
- Accept a medical query or symptom description.
- Call the knowledge_tool.
- Return the tool result as-is.
- DO NOT reason.
- DO NOT summarize.
- DO NOT modify.

Output format MUST be JSON:

{
  "query": "...",
  "evidence": [
    {
      "id": "...",
      "title": "...",
      "content": "...",
      "relevance_score": 0.0
    }
  ]
}"""
    ),
    tools=[knowledge_tool]
)


def run_knowledge_integration(query: str):
    # Run the knowledge agent
    response = root_agent.run({"query": query})

    try:
        output = json.loads(response)
    except Exception:
        return response

    evidence = output.get("evidence", [])

    # Log Expressible AI reasoning trace
    TraceManager.reasoning_trace(
        symptoms=[query],
        reasoning="Retrieved evidence only. No reasoning applied.",
        rules=["knowledge_retrieval"],
        conditions=[],
        confidence=1.0
    )

    return output
