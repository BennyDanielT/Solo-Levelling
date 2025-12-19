# Vercel AI SDK Integration Guide

## Overview

Your Solo Levelling frontend now uses the **Vercel AI SDK** (`ai` package) for robust chat management. The AI SDK provides:

- ✅ **Automatic message handling** - Built-in state management for chat flows
- ✅ **Streaming support** - Ready for real-time responses
- ✅ **Error handling** - Automatic error boundaries and retry logic
- ✅ **Loading states** - Built-in `isLoading` and error tracking
- ✅ **TypeScript support** - Full type safety
- ✅ **React hooks** - `useChat` hook with sensible defaults

## Installation

The required package is already installed:

```json
{
  "ai": "^5.0.108"
}
```

No additional installation needed!

## Updated Architecture

### Before (Custom Hook)
```
ChatInterface → custom useChat() → fetch API
                ↓
            Manual state management
            Manual error handling
            No streaming support
```

### After (Vercel AI SDK)
```
ChatInterface → useChat (from ai/react) → /api/chat
                ↓
            AI SDK handles:
            - Message state
            - Loading states
            - Errors
            - Streaming
            - Request queuing
```

## Usage Examples

### Basic Chat Component

```tsx
"use client";

import { useChat } from "ai/react";

export default function ChatComponent() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
  } = useChat({
    api: "/api/chat",
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}

      {error && <div className="error">{error.message}</div>}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
```

### With Custom Hook (useChat in lib/hooks/)

```tsx
import { useChat } from "@/lib/hooks/useChat";

export default function ChatInterface() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    threadId,
    metadata,
  } = useChat();

  return (
    // Render messages, form, etc.
  );
}
```

### Advanced: Custom Headers & Context

```tsx
const { messages, input, setInput, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
  headers: {
    "X-Custom-Header": "value",
  },
  onFinish: (message) => {
    console.log("Message completed:", message);
    // Handle completion events
  },
  onError: (error) => {
    console.error("Chat error:", error);
    // Handle errors
  },
});
```

### With Append for Programmatic Messages

```tsx
const { messages, append, isLoading } = useChat();

// Add a message programmatically
const handleSuggestedPrompt = async (prompt: string) => {
  await append({
    id: Date.now().toString(),
    role: "user",
    content: prompt,
  });
};
```

## API Endpoint (`app/api/chat/route.ts`)

The endpoint has been updated to work with the AI SDK:

### Request Format
```json
{
  "message": "What are my current goals?"
}
```

### Response Format
```json
{
  "content": "Here are your current goals: 1. Run 5km...",
  "reply": "Here are your current goals: 1. Run 5km...",
  "thread_id": "thread_abc123",
  "events": [],
  "metadata": {}
}
```

### Authentication

The route automatically:
1. Checks NextAuth session
2. Extracts JWT token from Authorization header
3. Forwards to FastAPI backend with token
4. Returns structured response

## Key Differences from Custom Hook

| Feature | Custom Hook | AI SDK |
|---------|------------|--------|
| State Management | Manual | Automatic |
| Error Handling | Manual try/catch | Built-in |
| Loading State | Manual | Automatic |
| Streaming | Manual parsing | Native support |
| Message History | Manual array | Automatic |
| Request Queuing | Not implemented | Built-in |
| Types | Custom interfaces | Provided |

## Advanced Features Available

### 1. Streaming with fetch options

```tsx
const { messages, input, setInput, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
  body: {
    // Additional body parameters
  },
});
```

### 2. Message Callbacks

```tsx
useChat({
  onResponse: (response) => {
    console.log("Got response:", response);
  },
  onFinish: (message) => {
    console.log("Message finished:", message);
    // Update UI, save to DB, etc.
  },
  onError: (error) => {
    console.log("Error:", error);
  },
});
```

### 3. Custom Message IDs

```tsx
const { append } = useChat();

await append({
  id: `msg_${Date.now()}`,
  role: "user",
  content: "My message",
  // Additional custom data
  data: {
    custom: "field",
  },
});
```

### 4. Reload Last Message

```tsx
const { reload, isLoading } = useChat();

// Retry the last interaction
await reload();
```

## Performance Optimization

### 1. Memoization

```tsx
import { useMemo, useCallback } from "react";

const Component = () => {
  const { messages } = useChat();
  
  // Only recompute when messages changes
  const messagesSummary = useMemo(() => {
    return messages.length;
  }, [messages]);

  return <>Messages: {messagesSummary}</>;
};
```

### 2. Lazy Loading Messages

```tsx
const { messages, data } = useChat();

// data contains additional response metadata
const metadata = data?.[0]; // Additional response fields
```

### 3. Stop Ongoing Request

```tsx
const { stop, isLoading } = useChat();

const handleCancel = () => {
  stop(); // Cancels the ongoing request
};
```

## Testing

### Unit Test Example

```tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/lib/hooks/useChat";

test("useChat sends message and receives response", async () => {
  const { result } = renderHook(() => useChat());

  act(() => {
    result.current.setInput("Hello");
  });

  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: () => {},
    } as any);
  });

  await waitFor(() => {
    expect(result.current.messages.length).toBeGreaterThan(1);
  });
});
```

## Troubleshooting

### Issue: "Message doesn't appear immediately"
**Solution**: AI SDK adds messages to state as they arrive. Use optimistic updates in your custom handlers if needed.

### Issue: "Headers not forwarding to FastAPI"
**Solution**: Check that `/api/chat` route properly extracts and forwards the auth header.

### Issue: "Old messages from previous sessions appear"
**Solution**: Clear messages on component mount using `initialMessages=[]` or custom reset logic.

### Issue: "Streaming responses feel slow"
**Solution**: Implement message streaming at the API level for chunk-based updates.

## Migration from Custom Hook

If you had a custom implementation, here's how to migrate:

**Before:**
```tsx
const { messages, input, setInput, sendMessage } = useCustomChat();
// Manual everything
```

**After:**
```tsx
const { messages, input, setInput, handleSubmit } = useChat({
  api: "/api/chat",
});
// Everything handled
```

## Next Steps

1. **Test the chat interface** at http://localhost:3000/coach
2. **Send a message** to verify it flows through the system
3. **Check browser console** for debug logs
4. **Monitor FastAPI logs** with: `docker compose logs fastapi -f`

## Resources

- **Vercel AI SDK Docs**: https://ai-sdk.dev/
- **useChat Hook API**: https://sdk.vercel.ai/docs/reference/ai-sdk-react/use-chat
- **React Integration**: https://sdk.vercel.ai/docs/guides/frameworks/react

## Full API Reference: useChat Options

```typescript
interface UseChatOptions {
  api?: string;                    // API endpoint (default: "/api/chat")
  id?: string;                     // Chat ID for persistence
  initialMessages?: Message[];     // Start with messages
  initialInput?: string;           // Initial input value
  sendExtraMessageFields?: boolean;// Include extra fields
  experimental_throttleWaitMs?: number;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials;
  onResponse?: (response: Response) => void;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}
```

Happy chatting! 🚀
