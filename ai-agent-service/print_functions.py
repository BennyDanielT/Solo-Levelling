"""
Print function definitions in the exact format for Azure AI Studio
"""
from agent_tools import AgentTools
import json

tools = AgentTools.get_tool_definitions()

print("\n" + "="*80)
print(" AZURE AI AGENT FUNCTION CONFIGURATION")
print("="*80)
print("\n📍 Go to: https://ai.azure.com/projects/life-hacker/agents")
print(f"🤖 Agent ID: asst_eUewJ0bWM0VuRaRkhCbpSqbl")
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
print("✅ TOTAL FUNCTIONS TO ADD: 6")
print("="*80)
print("\nSTEPS:")
print("1. Open Azure AI Studio: https://ai.azure.com")
print("2. Navigate to: Projects → life-hacker → Agents")
print("3. Click on your agent: asst_eUewJ0bWM0VuRaRkhCbpSqbl")
print("4. Look for 'Functions' or 'Tools' section")
print("5. Click 'Add Function' for each one above")
print("6. Copy the JSON and paste into the function editor")
print("7. Save each function")
print("\n" + "="*80)
