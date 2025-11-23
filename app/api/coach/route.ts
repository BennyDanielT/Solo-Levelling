import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DefaultAzureCredential } from '@azure/identity';
import { AIProjectClient } from '@azure/ai-projects';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Match JavaScript example exactly
    const projectEndpoint = process.env.AZURE_AI_PROJECT_ENDPOINT;
    const agentName = process.env.AZURE_AI_AGENT_NAME || 'life-hack-coach';

    if (!projectEndpoint) {
      return NextResponse.json(
        { success: false, error: 'AZURE_AI_PROJECT_ENDPOINT missing' },
        { status: 500 }
      );
    }

    // Create AI Project client (matching JavaScript example exactly)
    const projectClient = new AIProjectClient(
      projectEndpoint,
      new DefaultAzureCredential()
    );

    // Retrieve Agent by name (latest version) - matching user's example
    let retrievedAgent;
    try {
      // Try getting agent by name as ID
      retrievedAgent = await projectClient.agents.getAgent(agentName);
    } catch {
      // If not found, list agents and find by name
      const agentsIterator = projectClient.agents.listAgents();
      for await (const agent of agentsIterator) {
        if (agent.name === agentName) {
          retrievedAgent = agent;
          break;
        }
      }
      if (!retrievedAgent) {
        throw new Error(`Agent ${agentName} not found`);
      }
    }

    // Get OpenAI client - matching user's example
    const openAIClient = await projectClient.getAzureOpenAIClient();

    let conversation;
    
    // Use existing conversation or create new one - matching user's example structure
    if (conversationId) {
      // For existing conversation, we'll add the message
      // Note: The exact API may vary, this matches the pattern from the example
      conversation = { id: conversationId };
      await (openAIClient as any).conversations.createItem(conversationId, {
        type: 'message',
        role: 'user',
        content: message
      });
    } else {
      // Create new conversation with initial user message - matching user's example
      conversation = await (openAIClient as any).conversations.create({
        items: [
          { type: 'message', role: 'user', content: message }
        ]
      });
    }

    // Generate response using the agent - matching user's example exactly
    const response = await (openAIClient as any).responses.create(
      {
        conversation: conversation.id,
      },
      {
        body: {
          agent: {
            name: retrievedAgent.name || agentName,
            type: 'agent_reference'
          }
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: response.output_text,
      conversationId: conversation.id,
    });

  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

