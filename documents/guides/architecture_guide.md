# Interview Preparation: System Architecture Guide
This guide provides an end-to-end overview of the **Solo-Leveling AI Life Coach** system architecture, designed to help you answer system design, full-stack, and backend engineering interview questions.

---

## 1. High-Level Architectural Diagram
Below is the system architecture showing how requests flow from the client browser down to the databases and AI Foundry agents:

```mermaid
graph TD
    subgraph Client ["Client Side (User Browser)"]
        UI["Next.js Web UI (React & Tailwind)"]
    end

    subgraph Azure_ACA ["Azure Container Apps (Production VNet)"]
        subgraph NextJS_App ["Next.js Server App (NodeJS Standalone)"]
            AuthProxy["NextAuth.js Proxy"]
            RouteProxy["Server API Route Proxies (/api/goals, /api/stocks, /api/news)"]
        end

        subgraph FastAPI_App ["FastAPI Orchestration Backend (Python)"]
            FastAPI_Router["FastAPI App (ASGI)"]
            ChatService["Chat Service"]
            GoalService["Goal Service"]
        end

        subgraph MongoDB_App ["MongoDB Service (Internal Only)"]
            MongoDB_Instance[("MongoDB Database")]
        end
    end

    subgraph Azure_Foundry ["Azure AI Foundry (Managed Cloud SaaS)"]
        AI_Project["AI Project Client"]
        Azure_Agent["Azure AI Agent (LifeCoach v7)"]
    end

    %% Interactions
    UI -->|HTTPS Request / Auth Session| NextJS_App
    NextJS_App -->|Internal REST Call with JWT/Email| FastAPI_App
    FastAPI_App -->|Async DB Queries (Motor)| MongoDB_App
    FastAPI_App -->|Azure SDK Response Loop| Azure_Foundry
```

---

## 2. Component Explanations
When asked: *"Walk me through the tech stack and components of your application,"* use this breakdown:

### A. Frontend: Next.js (React 19 / Next.js 15)
* **Role**: User-facing dashboard, goal management interfaces, stock watchlists, personal newsfeeds, and the AI coach chat page.
* **Key Mechanisms**:
  * **NextAuth.js**: Implements OAuth (Google) and custom credentials sign-in using standard JWT strategy. It bridges login states to the FastAPI backend.
  * **Next.js Server API Routes**: Act as a reverse proxy for all client-side requests (e.g. `/api/goals`, `/api/stocks`, `/api/news`) mapping them to the server-side FastAPI url. This prevents CORS issues, shields the backend address from the browser, and handles JWT forwarding securely.
  * **Tailwind CSS & Lucide Icons**: Implements the dark-themed "gamer/Solo-Leveling" style.

### B. Orchestration Backend: FastAPI (Python 3.10)
* **Role**: Core application service implementing business logic, authentication, goal management, stock watchlists, news feeds, and AI agent coordination.
* **Key Mechanisms**:
  * **Asynchronous execution**: Uses Python's `asyncio` and ASGI standard to handle concurrent I/O operations (external API calls, MongoDB queries) efficiently.
  * **HTTPBearer Authorization**: Decodes NextAuth JWT tokens (using the `jose` library) or verifies OAuth users via direct email validation in the custom `auth.py` middleware.

### C. Database Layer: MongoDB (NoSQL)
* **Role**: Semi-structured persistent storage.
* **Key Collections**:
  * `users`: Stores hunter metadata, levels, XP (experience points), and profile configurations.
  * `goals`: Stores title, progress, priority, category, and target dates.
  * `chat_threads`: Persistent chat history mapped to Azure conversation IDs, allowing users to refresh the browser without losing chat state.

### D. AI Layer: Azure AI Foundry
* **Role**: Conversational agent and task-oriented reasoning.
* **Key Mechanisms**:
  * **Azure AI Project Client**: Coordinates agent creation, threading, and runs.
  * **Life Coach Agent**: Built on OpenAI's models (e.g., `gpt-4o`) configured to execute specific python functions (Tools) dynamically when the user makes requests.

---

## 3. Interview Scenarios: Questions & Answers

### Q1: "Why did you choose FastAPI over standard Next.js Server Actions or Node.js backends for your core logic?"
* **Answer Script**:
  > *"We chose Next.js specifically to serve our UI, optimize Core Web Vitals, and handle browser-facing authentication proxies. However, our core orchestration logic, integrations, and AI agent operations are written in FastAPI (Python) for three reasons:*
  > 1. *Python is the default ecosystem for AI and LLM software development. Azure AI Project SDKs and tools are best supported and updated in Python.*
  > 2. *FastAPI is designed for speed. By utilizing asynchronous endpoints, we can run multi-turn agent loops and third-party fetches without blocking the event loop.*
  > 3. *It establishes a clean separation of concerns. The frontend can change framework versions (e.g. Next.js 14 to 15) without impacting our core agent tool executions, security validation, or data mapping pipelines."*

### Q2: "How is security and user isolation handled across your double-hop architecture (Browser -> Next.js -> FastAPI)?"
* **Answer Script**:
  > *"When a user signs in, NextAuth.js issues a JWT on the server side which holds either the FastAPI access token (for credentials login) or the email address (for Google OAuth).*
  > *All frontend requests go through Next.js server-side routes. Next.js retrieves the session token and forwards it in the `Authorization: Bearer <token>` header to the FastAPI backend.*
  > *FastAPI intercepts the request, decodes the token, extracts the email, and injects it into a thread-safe context (`agent_tools.set_user_email`). When any DB operation or agent tool is run, it validates that the caller has ownership over the target document (e.g., matching the `userEmail` field on the database records)."*
