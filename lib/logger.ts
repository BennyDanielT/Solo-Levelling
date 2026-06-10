import crypto from "crypto";

const ENVIRONMENT = process.env.NODE_ENV || "production";
const SERVICE_NAME = "solo-leveling-nextjs";
const DEPLOYMENT_VERSION = process.env.DEPLOYMENT_VERSION || "1.0.0";

// Generate a unique SHA-256 privacy-safe user ID from email
export function getPrivacySafeUserId(email?: string | null): string {
  if (!email) return "anonymous";
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
}

export interface LogContext {
  route?: string;
  method?: string;
  request_id?: string;
  user_id?: string;
  status?: number;
  latency_ms?: number;
  tool_name?: string;
  agent_name?: string;
  model_name?: string;
  error_type?: string;
  error_message?: string;
  [key: string]: any;
}

class Logger {
  private log(level: "info" | "warn" | "error" | "debug", message: string, context: LogContext = {}) {
    const timestamp = new Date().toISOString();

    if (ENVIRONMENT === "development") {
      // Human-readable console logging for local dev
      const ctxStr = Object.keys(context).length ? ` | ${JSON.stringify(context)}` : "";
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${ctxStr}`);
      return;
    }

    // Production: output structured JSON (ECS-aligned format)
    const logData: Record<string, any> = {
      "@timestamp": timestamp,
      "log.level": level,
      "message": message,
      "service": {
        "name": SERVICE_NAME,
        "version": DEPLOYMENT_VERSION,
        "environment": ENVIRONMENT
      },
      "event": {
        "created": timestamp
      }
    };

    // Map context fields
    if (context.request_id) {
      logData.transaction = { id: context.request_id };
    }
    if (context.user_id) {
      logData.user = { id: context.user_id };
    }
    
    if (context.method || context.route) {
      logData.http = {
        request: {
          method: context.method,
          referrer: context.route
        },
        response: {
          status_code: context.status
        }
      };
      if (context.latency_ms) {
        logData.latency_ms = context.latency_ms;
        logData.event.duration = Math.round(context.latency_ms * 1000000); // ns
      }
    }

    // Copy other custom business fields
    const customFields = [
      "tool_name", "agent_name", "model_name",
      "error_type", "error_message", "mongodb_failure",
      "external_api_call", "api_url"
    ];
    for (const field of customFields) {
      if (context[field] !== undefined) {
        logData[field] = context[field];
      }
    }

    console.log(JSON.stringify(logData));
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }
}

export const logger = new Logger();
