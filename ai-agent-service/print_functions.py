"""
Print function definitions in the exact format for Azure AI Studio
"""
import os
from dotenv import load_dotenv
load_dotenv()

from agent_tools import AgentTools
import json

tools = AgentTools.get_tool_definitions()
agent_id = os.getenv("AZURE_EXISTING_AGENT_ID", "LifeCoach")
endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT", "Not Configured")

print("\n" + "="*80)
print(" AZURE AI AGENT FUNCTION CONFIGURATION")
print("="*80)
print(f"🤖 Agent ID: {agent_id}")
print(f"📍 Project Endpoint: {endpoint}")
print("\n" + "="*80)
print("\n📋 COPY AND PASTE EACH FUNCTION DEFINITION BELOW:\n")

for i, tool in enumerate(tools, 1):
    func = tool["function"]
    print(f"\n{'='*80}")
    print(f"FUNCTION #{i}: {func['name']}")
    print('='*80)
    print(json.dumps(func, indent=2))
    print("\n")

print("="*80)
print(f"✅ TOTAL FUNCTIONS TO ADD: {len(tools)}")
print("="*80)
print("\nSTEPS:")
print("1. Open Azure AI Studio or Azure Portal")
print("2. Navigate to your AI Project and locate the Agent: " + agent_id)
print("3. Look for 'Functions' or 'Tools' section")
print("4. Click 'Add Function' for each tool shown above")
print("5. Copy/paste the JSON definition and save")
print("="*80)

