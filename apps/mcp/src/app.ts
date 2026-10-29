/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
import type { ConvexHttpClient } from "convex/browser";
import cors from "cors";
import express, { type Response } from "express";
import { resolveTransport } from "./sessions.js";
import { parseBearerToken } from "./tool-helpers.js";
import { createMcpServer } from "./tools.js";

const UNAUTHORIZED_STATUS = 401;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const JSON_RPC_BAD_REQUEST_CODE = -32_000;
const JSON_RPC_INTERNAL_ERROR_CODE = -32_603;
// Fits create_image_flashcard with two 5 MB images as base64 (+33%).
const MAX_REQUEST_BODY = "16mb";

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

type AppOptions = {
  /** How long a session may go without requests before it is closed. */
  sessionIdleTimeoutMs?: number;
};

/** Builds the HTTP app serving MCP at `/mcp`, backed by `client`. */
export function createApp(
  client: ConvexHttpClient,
  { sessionIdleTimeoutMs }: AppOptions = {}
) {
  const app = express();
  app.use(
    cors({
      origin: "*",
      methods: "GET,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: [
        "mcp-session-id",
        "last-event-id",
        "mcp-protocol-version",
      ],
    })
  );
  app.use(express.json({ limit: MAX_REQUEST_BODY }));

  app.use((req, res, next) => {
    if (!parseBearerToken(req.headers.authorization)) {
      res.status(UNAUTHORIZED_STATUS).send("Unauthorized");
      return;
    }

    next();
  });

  // POST (messages), GET (SSE stream) and DELETE (session termination) are all
  // dispatched by the session's transport.
  app.all("/mcp", async (req, res) => {
    try {
      const resolved = await resolveTransport(
        req.headers["mcp-session-id"] as string | undefined,
        req.body,
        () => createMcpServer(client),
        sessionIdleTimeoutMs
      );
      if ("errorStatus" in resolved) {
        sendJsonRpcError(
          res,
          resolved.errorStatus,
          JSON_RPC_BAD_REQUEST_CODE,
          resolved.errorMessage
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

  return app;
}
