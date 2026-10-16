/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import { ConvexHttpClient } from "convex/browser";
import cors from "cors";
import { config } from "dotenv";
import express, { type Response } from "express";
import { z } from "zod";

config({ path: ".env.local" });

const APP_NAME = "Spaced Repetition App";
const APP_VERSION = "1.0.0";
const DEFAULT_PORT = 3002;
const PORT = Number(process.env.PORT ?? DEFAULT_PORT);
const AUTH_HEADER_PREFIX = "Bearer ";
const UNAUTHORIZED_STATUS = 401;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const JSON_RPC_BAD_REQUEST_CODE = -32_000;
const JSON_RPC_INTERNAL_ERROR_CODE = -32_603;
const MIN_MCQ_OPTIONS = 2;
// Clients that vanish without sending DELETE would otherwise keep their
// session (a transport plus an McpServer) in memory forever.
const SESSION_IDLE_TIMEOUT_MS = 1_800_000; // 30 minutes

if (!process.env.CONVEX_URL) {
  throw new Error("Missing env variable: CONVEX_URL");
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

// --- Tool definitions -------------------------------------------------------

// Optional organization fields accepted by every card-creation tool.
const deckAndTagsInput = {
  deck: z.string().optional().describe("Existing deck name"),
  tags: z.array(z.string()).optional().describe("Tags for organization"),
};

// Every card-creation tool returns the new card id and a human-readable message.
const cardCreatedOutput = {
  id: z.string(),
  message: z.string(),
};

function cardCreatedResult(cardKind: string, id: string) {
  const output = {
    id,
    message: `Successfully created ${cardKind} with ID: ${id}`,
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    structuredContent: output,
  };
}

// Each MCP session needs its own server instance: `McpServer.connect` binds a
// single transport, so sharing one server across sessions would misroute
// responses between concurrent clients.
function createMcpServer() {
  const server = new McpServer({ name: APP_NAME, version: APP_VERSION });

  server.registerTool(
    "create_flashcard",
    {
      title: "Create Flashcard",
      description: "Create a question and answer flashcard for a user",
      inputSchema: {
        question: z.string(),
        answer: z.string(),
        ...deckAndTagsInput,
      },
      outputSchema: cardCreatedOutput,
    },
    async ({ question, answer, deck, tags }, extra) => {
      const card = await client.mutation(api.cards.createQuestionCard, {
        apiKey: getApiKeyFromExtra(extra),
        question,
        answer,
        deck,
        tags,
      });

      return cardCreatedResult("flashcard", card);
    }
  );

  server.registerTool(
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
        ...deckAndTagsInput,
      },
      outputSchema: cardCreatedOutput,
    },
    async (
      { question, answer, options, correctOptionIndex, deck, tags },
      extra
    ) => {
      const card = await client.mutation(api.cards.createQuestionCard, {
        apiKey: getApiKeyFromExtra(extra),
        question,
        answer,
        options,
        correctOptionIndex,
        deck,
        tags,
      });

      return cardCreatedResult("MCQ flashcard", card);
    }
  );

  server.registerTool(
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
        ...deckAndTagsInput,
      },
      outputSchema: cardCreatedOutput,
    },
    async (
      { question, questionCode, answer, answerCode, language, deck, tags },
      extra
    ) => {
      const card = await client.mutation(api.cards.createCodeCard, {
        apiKey: getApiKeyFromExtra(extra),
        question,
        questionCode,
        answer,
        answerCode,
        language,
        deck,
        tags,
      });

      return cardCreatedResult("code flashcard", card);
    }
  );

  return server;
}

// --- Session management -----------------------------------------------------

type Session = {
  transport: StreamableHTTPServerTransport;
  idleTimer?: NodeJS.Timeout;
};

const sessions: Map<string, Session> = new Map();

// (Re)starts the countdown after which an unused session is closed.
function touchSession(sessionId: string, session: Session) {
  clearTimeout(session.idleTimer);
  session.idleTimer = setTimeout(() => {
    console.log(`Session idle, closing: ${sessionId}`);
    session.transport.close();
  }, SESSION_IDLE_TIMEOUT_MS);
}

type ResolvedTransport =
  | { kind: "ok"; transport: StreamableHTTPServerTransport }
  | { kind: "unknown-session" }
  | { kind: "not-initialize" };

// Returns the transport for an existing session, or opens a new session when
// the request is an `initialize` call.
async function resolveTransport(
  sessionId: string | undefined,
  body: unknown
): Promise<ResolvedTransport> {
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return { kind: "unknown-session" };
    }
    touchSession(sessionId, session);
    return { kind: "ok", transport: session.transport };
  }
  if (!isInitializeRequest(body)) {
    return { kind: "not-initialize" };
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (newSessionId) => {
      const session: Session = { transport };
      sessions.set(newSessionId, session);
      touchSession(newSessionId, session);
      console.log(`Session initialized: ${newSessionId}`);
    },
  });

  // Fires on DELETE /mcp (handled by the transport) or any other close.
  transport.onclose = () => {
    const id = transport.sessionId;
    if (id) {
      clearTimeout(sessions.get(id)?.idleTimer);
      sessions.delete(id);
      console.log(`Session closed: ${id}`);
    }
  };

  await createMcpServer().connect(transport);
  return { kind: "ok", transport };
}

function sendJsonRpcError(
  res: Response,
  status: number,
  code: number,
  message: string
) {
  res.status(status).json({
    jsonrpc: "2.0",
    error: { code, message },
    id: null,
  });
}

// --- HTTP server ------------------------------------------------------------

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
app.use(express.json());

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(AUTH_HEADER_PREFIX)) {
    res.status(UNAUTHORIZED_STATUS).send("Unauthorized");
    return;
  }

  next();
});

// POST (messages), GET (SSE stream) and DELETE (session termination) are all
// dispatched by the session's transport.
app.all("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const resolved = await resolveTransport(sessionId, req.body);
    // Per the Streamable HTTP spec, 404 tells clients their session is gone
    // (e.g. after a server restart) so they re-initialize.
    if (resolved.kind === "unknown-session") {
      sendJsonRpcError(
        res,
        NOT_FOUND_STATUS,
        JSON_RPC_BAD_REQUEST_CODE,
        "Session not found"
      );
      return;
    }
    if (resolved.kind === "not-initialize") {
      sendJsonRpcError(
        res,
        BAD_REQUEST_STATUS,
        JSON_RPC_BAD_REQUEST_CODE,
        "Bad Request: No valid session ID provided"
      );
      return;
    }

    await resolved.transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      sendJsonRpcError(
        res,
        INTERNAL_SERVER_ERROR_STATUS,
        JSON_RPC_INTERNAL_ERROR_CODE,
        "Internal server error"
      );
    }
  }
});

app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
