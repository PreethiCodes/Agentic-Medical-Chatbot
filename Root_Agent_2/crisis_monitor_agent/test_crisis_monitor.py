from crisis_agent import CrisisMonitorAgent

agent = CrisisMonitorAgent("crisis_keywords.json")

tests = [
    "I feel like I can't breathe, my heart is racing.",
    "I want to end it today.",
    "I'm crying a lot, everything is falling apart.",
    "I'm so overwhelmed I can't think.",
    "I am calm and okay."
]

for text in tests:
    print("\nUser Input:", text)
    result = agent.detect_crisis(text)
    print("Output:", result)
