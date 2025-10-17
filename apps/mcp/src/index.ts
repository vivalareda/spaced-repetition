/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
/** biome-ignore-all lint/style/noNonNullAssertion: <temporary> */
import { randomUUID } from "node:crypto";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import { ConvexHttpClient } from "convex/browser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { z } from "zod";

config({ path: ".env.local" });

const APP_NAME = "Spaced Repetition App";
const APP_VERSION = "1.0.0";
const PORT = 3002;
const AUTH_HEADER_PREFIX = "Bearer ";
const UNAUTHORIZED_STATUS = 401;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const BAD_REQUEST_STATUS = 400;
const JSON_RCP_ERROR_CODE = -32_603;

const mcpServer = new McpServer({
  name: APP_NAME,
  version: APP_VERSION,
});

if (!process.env.CONVEX_URL) {
  throw new Error("Missing env variable");
}

if (!process.env.REMEMBR_API_KEY) {
  throw new Error("Missing env variable API_KEY");
}

const client = new ConvexHttpClient(process.env.CONVEX_URL);

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: ["mcp-session-id", "last-event-id", "mcp-protocol-version"],
  })
);

const transports: Map<string, StreamableHTTPServerTransport> = new Map();

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(AUTH_HEADER_PREFIX)) {
    res.status(UNAUTHORIZED_STATUS).send("Unauthorized");
    return;
  }

  next();
});

app.delete("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res);
      transports.delete(sessionId);
      console.error(`Session terminated: ${sessionId}`);
    } else {
      res.status(BAD_REQUEST_STATUS).json({
        jsonrpc: "2.0",
        error: {
          code: -32_000,
          message: "Session not found",
        },
      });
    }
  } catch (error) {
    console.error("Error handling DELETE request:", error);
    if (!res.headersSent) {
      res.status(INTERNAL_SERVER_ERROR_STATUS).json({
        jsonrpc: "2.0",
        error: {
          code: -32_603,
          message: "Internal server error",
        },
      });
    }
  }
});

app.all("/mcp", async (req, res) => {
  try {
    console.log("handling mcp request from", req.headers["mcp-session-id"]);
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: StreamableHTTPServerTransport | undefined;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId);
      if (transport === undefined) {
        throw new Error("Transport not found");
      }
    } else {
      const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        eventStore,
        onsessioninitialized: (newSessionId: string) => {
          if (transport === undefined) {
            throw new Error("Transport not found");
          }
          transports.set(newSessionId, transport);
        },
      });

      await mcpServer.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(INTERNAL_SERVER_ERROR_STATUS).json({
        jsonrpc: "2.0",
        error: {
          code: JSON_RCP_ERROR_CODE,
          message: "Internal server error",
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});

mcpServer.registerTool(
  "create_flashcard",
  {
    title: "Create Flashcard",
    description: "Create a question and answer flashcard for a user",
    inputSchema: {
      question: z.string(),
      answer: z.string(),
    },
    outputSchema: {
      id: z.string(),
      message: z.string(),
    },
  },

  async ({ question, answer }, extra) => {
    if (!extra.requestInfo?.headers.authorization) {
      throw new Error("Not authenticated");
    }

    const apiKeyHeader = extra.requestInfo?.headers.authorization;

    const token = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    if (!token) {
      throw new Error("Invalid API key");
    }

    const apiKey = token.substring(AUTH_HEADER_PREFIX.length);

    const card = await client.mutation(api.cards.createQuestionCard, {
      question,
      answer,
      apiKey,
    });

    const output = {
      id: card,
      message: `Successfully created flashcard with ID: ${card}`,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output),
        },
      ],
      structuredContent: output,
    };
  }
);

mcpServer.registerTool(
  "generate_random_number",
  {
    title: "Generate Random Number",
    description: "Generate a random number between min and max",
    inputSchema: {
      min: z.number().describe("Minimum value"),
      max: z.number().describe("Maximum value"),
    },
    outputSchema: {
      randomNumber: z.number(),
    },
  },
  ({ min, max }, extra) => {
    console.log(extra.requestInfo?.headers.authorization);

    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const output = { randomNumber: randomNum };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output),
        },
      ],
      structuredContent: output,
    };
  }
);
