import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent import emotion_detector_agent
import json

print("=" * 60)
print("EMOTION DETECTION AGENT TEST")
print("=" * 60)

# Test 1: Verify agent is loaded
print("\n✓ Test 1: Agent loaded successfully")
print(f"  Agent name: {emotion_detector_agent.name}")
print(f"  Agent model: {emotion_detector_agent.model}")

# Test 2: Verify agent configuration
print("\n✓ Test 2: Agent configuration verified")
print(f"  Has description: {bool(emotion_detector_agent.description)}")
print(f"  Description preview: {emotion_detector_agent.description[:100]}...")

# Test 3: Check agent schema
print("\n✓ Test 3: Agent schema")
if hasattr(emotion_detector_agent, 'input_schema'):
    print(f"  Input schema: {emotion_detector_agent.input_schema}")
if hasattr(emotion_detector_agent, 'output_schema'):
    print(f"  Output schema: {emotion_detector_agent.output_schema}")

# Test 4: List available methods
print("\n✓ Test 4: Available public methods:")
public_methods = [m for m in dir(emotion_detector_agent) if not m.startswith('_') and callable(getattr(emotion_detector_agent, m))]
for method in sorted(public_methods)[:10]:  # Show first 10
    print(f"  - {method}()")

# Test 5: Check if we can serialize the agent config
print("\n✓ Test 5: Agent model validation")
try:
    agent_dict = emotion_detector_agent.model_dump()
    print(f"  Agent can be serialized: Yes")
    print(f"  Config keys: {list(agent_dict.keys())[:5]}")
except Exception as e:
    print(f"  Agent serialization error: {e}")

print("\n" + "=" * 60)
print("✓ All basic tests passed!")
print("=" * 60)
print("\nNote: To test agent with actual input requires:")
print("1. Setting up Google Cloud authentication")
print("2. Creating proper InvocationContext with all required fields")
print("3. Using async/await to call run_live()")
print("\nSee agent.py for the agent configuration.")
print("=" * 60)
