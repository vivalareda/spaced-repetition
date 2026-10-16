/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
import { randomUUID } from "node:crypto";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
// Clients that vanish without sending DELETE would otherwise keep their
// session (a transport plus an McpServer) in memory forever.
const SESSION_IDLE_TIMEOUT_MS = 1_800_000; // 30 minutes

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

// Opens a session for an `initialize` request. The transport registers the
// session once it assigns an id, and removes it (and its idle timer) when it
// closes, whether by DELETE /mcp, idle timeout, or any other reason.
async function openSession(createServer: () => McpServer) {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      const session: Session = { transport };
      sessions.set(sessionId, session);
      touchSession(sessionId, session);
      console.log(`Session initialized: ${sessionId}`);
    },
  });

  transport.onclose = () => {
    const id = transport.sessionId;
    if (id) {
      clearTimeout(sessions.get(id)?.idleTimer);
      sessions.delete(id);
      console.log(`Session closed: ${id}`);
    }
  };

  await createServer().connect(transport);
  return transport;
}

type ResolvedTransport =
  | { transport: StreamableHTTPServerTransport }
  | { errorStatus: number; errorMessage: string };

/**
 * Returns the transport that should handle a request: the existing session's,
 * or a new session's when the request is an `initialize` call. Otherwise
 * returns the HTTP status and message to reject the request with.
 */
export async function resolveTransport(
  sessionId: string | undefined,
  body: unknown,
  createServer: () => McpServer
): Promise<ResolvedTransport> {
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      // Per the Streamable HTTP spec, 404 tells clients their session is gone
      // (e.g. after a server restart) so they re-initialize.
      return {
        errorStatus: NOT_FOUND_STATUS,
        errorMessage: "Session not found",
      };
    }
    touchSession(sessionId, session);
    return { transport: session.transport };
  }
  if (!isInitializeRequest(body)) {
    return {
      errorStatus: BAD_REQUEST_STATUS,
      errorMessage: "Bad Request: No valid session ID provided",
    };
  }
  return { transport: await openSession(createServer) };
}
