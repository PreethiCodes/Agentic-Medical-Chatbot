from knowledge_integration_agent.agent import KnowledgeIntegrationAgent




# Fake model for testing
class DummyModel:
    def __call__(self, prompt):
        print("\n--- PROMPT SENT TO MODEL ---")
        print(prompt)
        print("-----------------------------\n")

        # return simple JSON output to test pipeline
        return """
        {
          "conditions": [
            {
              "name": "asthma",
              "overview": "Chronic inflammatory airway disease.",
              "common_causes": ["allergens"],
              "risk_factors": ["family history"],
              "recommended_tests": ["spirometry"],
              "standard_treatment_principles": ["inhaled corticosteroids"]
            }
          ],
          "medical_sources": [
            {"source_name": "GINA Guidelines", "type": "guideline"}
          ]
        }
        """

# Create the agent
agent = KnowledgeIntegrationAgent(model=DummyModel())

# Run test
output = agent.run(["asthma"])

print("\n--- FINAL PARSED OUTPUT ---")
print(output)

# Validation check
assert output is not None, "Output is None"
from knowledge_integration_agent.schemas import KnowledgeIntegrationOutput
assert isinstance(output, KnowledgeIntegrationOutput), "Output should be a KnowledgeIntegrationOutput model"

print("\n✓ Test passed!")
