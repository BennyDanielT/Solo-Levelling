'use server';
import 'dotenv/config';

const userMessage =
  process.env.MESSAGE ||
  process.argv[2] ||
  'What is the size of France in square miles?';

const FASTAPI_SERVICE_URL = 'http://localhost:8000';

async function main() {
  try {
    if (!userMessage) {
      throw new Error("Missing 'message' in environment or arguments");
    }

    console.log('User Message:', userMessage);
    console.log('---\n');

    // Call FastAPI service
    const response = await fetch(`${FASTAPI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI service error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('--- Response ---');
    console.log(`Agent: ${data.responseText}`);
    console.log(`\nThread ID: ${data.threadId}`);
    console.log(`Run ID: ${data.runId}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  }
}

main();
