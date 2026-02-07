/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
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

const client = new ConvexHttpClient(process.env.CONVEX_URL);

function getApiKeyFromExtra(extra: { requestInfo?: { headers: unknown } }) {
  const headers = extra.requestInfo?.headers as
    | { authorization?: string | string[] }
    | undefined;

  const authHeader = headers?.authorization;
  if (!authHeader) {
    throw new Error("Not authenticated");
  }

  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!token?.startsWith(AUTH_HEADER_PREFIX)) {
    throw new Error("Invalid API key");
  }

  return token.substring(AUTH_HEADER_PREFIX.length);
}

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
      const transport = transports.get(sessionId);
      if (transport === undefined) {
        throw new Error("Transport not found");
      }
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
    const apiKey = getApiKeyFromExtra(extra);

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

const MIN_MCQ_OPTIONS = 2;

mcpServer.registerTool(
  "create_mcq_flashcard",
  {
    title: "Create MCQ flashcard",
    description:
      "Create a multiple-choice flashcard for the user with options and a correct answer index",
    inputSchema: {
      question: z.string(),
      answer: z.string().describe("Explanation for the correct answer"),
      options: z
        .array(z.string())
        .min(MIN_MCQ_OPTIONS)
        .describe("The answer options"),
      correctOptionIndex: z
        .number()
        .int()
        .min(0)
        .describe("Zero-based index of the correct option"),
    },
    outputSchema: {
      id: z.string(),
      message: z.string(),
    },
  },
  async ({ question, answer, options, correctOptionIndex }, extra) => {
    const apiKey = getApiKeyFromExtra(extra);

    const card = await client.mutation(api.cards.createQuestionCard, {
      question,
      answer,
      apiKey,
      options,
      correctOptionIndex,
    });

    const output = {
      id: card,
      message: `Successfully created MCQ flashcard with ID: ${card}`,
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
  "create_code_flashcard",
  {
    title: "Create Code Flashcard",
    description:
      "Create a coding flashcard with a code snippet and optional solution code",
    inputSchema: {
      question: z.string().min(1).describe("The prompt or question"),
      questionCode: z
        .string()
        .min(1)
        .describe("The code snippet shown with the question"),
      answer: z.string().min(1).describe("Explanation for the answer"),
      answerCode: z
        .string()
        .optional()
        .describe("Optional solution code snippet"),
      language: z
        .string()
        .min(1)
        .describe("e.g. javascript, typescript, python"),
      deck: z.string().optional().describe("Existing deck name"),
      tags: z.array(z.string()).optional().describe("Tags for organization"),
    },
    outputSchema: {
      id: z.string(),
      message: z.string(),
    },
  },
  async (
    { question, questionCode, answer, answerCode, language, deck, tags },
    extra
  ) => {
    const apiKey = getApiKeyFromExtra(extra);

    const card = await client.mutation(api.cards.createCodeCard, {
      question,
      questionCode,
      answer,
      answerCode,
      language,
      deck,
      tags,
      apiKey,
    });

    const output = {
      id: card,
      message: `Successfully created code flashcard with ID: ${card}`,
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
