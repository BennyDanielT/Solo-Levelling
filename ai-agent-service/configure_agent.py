"""
Script to configure Azure AI Agent with function tools
Run this to add function calling capabilities to your agent
"""
import os
from azure.ai.projects import AIProjectClient
from azure.identity import ClientSecretCredential
from agent_tools import AgentTools
from dotenv import load_dotenv
from loguru import logger

load_dotenv()


def configure_agent_functions():
    """Add function tools to the Azure AI agent using update_agent"""
    
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
        logger.info(f"🤖 Getting current agent configuration...")
        
        # First, get the existing agent
        existing_agent = agents_client.get_agent(agent_id)
        logger.info(f"✅ Found agent: {existing_agent.name}")
        logger.info(f"   Model: {existing_agent.model}")
        logger.info(f"   Current tools: {len(existing_agent.tools or [])}")
        
        # Update the agent with new tools
        logger.info(f"📤 Updating agent with {len(tools)} function tools...")
        
        updated_agent = agents_client.update_agent(
            agent_id=agent_id,
            tools=tools
        )
        
        logger.info(f"✅ Agent updated successfully!")
        logger.info(f"   Agent name: {updated_agent.name}")
        logger.info(f"   Agent ID: {updated_agent.id}")
        logger.info(f"   Tools configured: {len(updated_agent.tools or [])}")
        
        print("\n" + "="*60)
        print("🎉 SUCCESS! Your agent now has function calling capabilities:")
        print("="*60)
        for tool in tools:
            print(f"  ✓ {tool['function']['name']}")
        print("="*60)
        print("\nYour agent can now:")
        print("  • Access user's goals and track progress")
        print("  • Get user profile information")
        print("  • Check stock watchlist and prices")
        print("  • View news preferences")
        print("  • Search for stocks")
        print("  • Create new goals")
        print("\nTry asking: 'What are my current goals?' or 'How's my stock portfolio?'")
        
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