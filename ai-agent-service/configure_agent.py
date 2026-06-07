"""
Script to configure Azure AI Agent with function tools
Run this to add function calling capabilities to your agent
"""
from dotenv import load_dotenv
load_dotenv()

import os
from azure.ai.projects import AIProjectClient
from azure.identity import ClientSecretCredential
from agent_tools import AgentTools
from loguru import logger


def configure_agent_functions():
    """Add function tools to the Azure AI agent using update_agent"""
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    
    # Initialize credentials
    tenant_id = os.getenv("AZURE_TENANT_ID")
    client_id = os.getenv("AZURE_CLIENT_ID")
    client_secret = os.getenv("AZURE_CLIENT_SECRET")
    project_endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
    agent_id = os.getenv("AZURE_EXISTING_AGENT_ID")
    
    if not all([tenant_id, client_id, client_secret, project_endpoint, agent_id]):
        logger.error("❌ Missing required environment variables")
        return
    
    # Create credential
    credential = ClientSecretCredential(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret
    )
    
    # Initialize client
    logger.info(f"🔧 Connecting to Azure AI Project: {project_endpoint}")
    project_client = AIProjectClient(
        endpoint=project_endpoint,
        credential=credential
    )
    
    # Get agents client
    agents_client = project_client.agents
    
    # Get function definitions in the correct format
    tools = AgentTools.get_tool_definitions()
    logger.info(f"📋 Found {len(tools)} function tools to add")
    
    for tool in tools:
        func_name = tool["function"]["name"]
        func_desc = tool["function"]["description"]
        logger.info(f"  - {func_name}: {func_desc}")
    
    # Update agent with tools using the correct SDK method
    try:
        from azure.ai.projects.models import PromptAgentDefinition, FunctionTool, WebSearchTool

        # Convert definitions from AgentTools to FunctionTool instances
        converted_tools = []
        for td in tools:
            if td["type"] == "function":
                f = td["function"]
                ft = FunctionTool(
                    name=f["name"],
                    description=f.get("description", ""),
                    parameters=f.get("parameters", {}),
                    strict=False
                )
                converted_tools.append(ft)
        converted_tools.append(WebSearchTool())

        logger.info(f"📤 Creating new version for prompt agent '{agent_id}' with {len(converted_tools)} tools...")
        
        agent_version = project_client.agents.create_version(
            agent_name=agent_id,
            definition=PromptAgentDefinition(
                model="gpt-5.4-nano",
                instructions="You are a professional life coach helping users track and accomplish their personal and professional goals.",
                tools=converted_tools,
            )
        )
        
        logger.info(f"✅ Agent version created successfully!")
        logger.info(f"   Agent Name: {agent_id}")
        logger.info(f"   Version ID: {agent_version.get('version')}")
        logger.info(f"   Agent ID: {agent_version.get('id')}")
        
        print("\n" + "="*60)
        print("🎉 SUCCESS! Your agent now has function calling capabilities:")
        print("="*60)
        for td in tools:
            print(f"  ✓ {td['function']['name']}")
        print("  ✓ web_search")
        print("="*60)
        print("\nYour agent can now:")
        print("  • Access user's goals and track progress")
        print("  • Get user profile information")
        print("  • Check stock watchlist and prices")
        print("  • View news preferences")
        print("  • Search for stocks")
        print("  • Create new goals")
        print(f"\nCreated version {agent_version.get('version')} successfully.")
        
    except Exception as e:
        logger.error(f"❌ Failed to update agent: {e}")
        logger.error(f"   Error type: {type(e).__name__}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Provide manual instructions
        print("\n" + "="*60)
        print("📋 FALLBACK: Manual Configuration Required")
        print("="*60)
        print(f"\nSee AGENT_FUNCTIONS_GUIDE.md for complete instructions")
        print("Or use the Azure AI Studio portal to add functions manually")


if __name__ == "__main__":
    logger.info("🚀 Starting agent configuration...")
    configure_agent_functions()