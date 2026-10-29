import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ConvexHttpClient } from "convex/browser";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createApp } from "./app.js";

const API_KEY = "test-key";
const AUTH = { authorization: `Bearer ${API_KEY}` };
const SHORT_IDLE_TIMEOUT_MS = 50;
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const TOOL_NAMES = [
  "create_code_flashcard",
  "create_deck",
  "create_flashcard",
  "create_image_flashcard",
  "create_mcq_flashcard",
  "delete_card",
  "delete_deck",
  "get_card",
  "get_next_card",
  "get_study_overview",
  "list_cards",
  "list_decks",
  "list_due_cards",
  "move_card",
  "rate_card",
  "reveal_answer",
  "start_review",
  "update_card",
  "update_deck",
];

const mutation = vi.fn(async () => "card-1");
const client = { mutation } as unknown as ConvexHttpClient;

let server: Server;
let url: URL;

/** Serves `createApp(client, options)` on a free port; returns its MCP URL. */
async function listen(options?: Parameters<typeof createApp>[1]) {
  const listening = createApp(client, options).listen(0);
  await new Promise((resolve) => listening.once("listening", resolve));
  const address = listening.address() as AddressInfo;
  return {
    server: listening,
    url: new URL(`http://127.0.0.1:${address.port}/mcp`),
  };
}

function stop(listening: Server) {
  listening.closeAllConnections();
  listening.close();
}

beforeAll(async () => {
  ({ server, url } = await listen());
});

afterAll(() => {
  stop(server);
});

beforeEach(() => {
  mutation.mockClear();
});

async function connect(mcpUrl = url) {
  const transport = new StreamableHTTPClientTransport(mcpUrl, {
    requestInit: { headers: AUTH },
  });
  const mcp = new Client({ name: "test", version: "1.0.0" });
  await mcp.connect(transport);
  return { mcp, transport, sessionId: transport.sessionId as string };
}

// A raw tools/list request, used to probe whether a session id is still live.
function listToolsRaw(sessionId: string, mcpUrl = url) {
  return fetch(mcpUrl, {
    method: "POST",
    headers: {
      ...AUTH,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
}

describe("HTTP gate", () => {
  it("rejects requests without a bearer token", async () => {
    const res = await fetch(url, { method: "POST" });
    expect(res.status).toBe(UNAUTHORIZED);
  });

  it("rejects non-initialize requests without a session", async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...AUTH, "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    expect(res.status).toBe(BAD_REQUEST);
  });

  it("returns 404 for an unknown session so clients re-initialize", async () => {
    const res = await listToolsRaw("no-such-session");
    expect(res.status).toBe(NOT_FOUND);
  });
});

describe("card tools", () => {
  it("exposes the card-creation, review and library tools", async () => {
    const { mcp } = await connect();
    const { tools } = await mcp.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(TOOL_NAMES);
    await mcp.close();
  });

  it("forwards validated arguments plus the caller's API key", async () => {
    const { mcp } = await connect();
    const result = await mcp.callTool({
      name: "create_mcq_flashcard",
      arguments: {
        question: "2 + 2?",
        answer: "Arithmetic",
        options: ["3", "4"],
        correctOptionIndex: 1,
        tags: ["math"],
      },
    });

    expect(mutation).toHaveBeenCalledWith(expect.anything(), {
      apiKey: API_KEY,
      question: "2 + 2?",
      answer: "Arithmetic",
      options: ["3", "4"],
      correctOptionIndex: 1,
      tags: ["math"],
    });
    expect(result.structuredContent).toEqual({
      id: "card-1",
      message: "Successfully created MCQ flashcard with ID: card-1",
    });
    await mcp.close();
  });

  it("rejects invalid arguments without calling the backend", async () => {
    const { mcp } = await connect();
    await expect(
      mcp.callTool({
        name: "create_mcq_flashcard",
        arguments: {
          question: "q",
          answer: "a",
          options: ["only one"],
          correctOptionIndex: 0,
        },
      })
    ).rejects.toThrow("Invalid arguments");
    expect(mutation).not.toHaveBeenCalled();
    await mcp.close();
  });
});

describe("session lifecycle", () => {
  it("keeps concurrent sessions independent", async () => {
    const a = await connect();
    const b = await connect();
    expect(a.sessionId).not.toBe(b.sessionId);

    await a.transport.terminateSession();
    expect((await listToolsRaw(a.sessionId)).status).toBe(NOT_FOUND);
    expect((await b.mcp.listTools()).tools).toHaveLength(TOOL_NAMES.length);
    await b.mcp.close();
  });

  it("closes sessions that stay idle", async () => {
    const shortLived = await listen({
      sessionIdleTimeoutMs: SHORT_IDLE_TIMEOUT_MS,
    });
    try {
      const { sessionId } = await connect(shortLived.url);
      await new Promise((resolve) =>
        setTimeout(resolve, SHORT_IDLE_TIMEOUT_MS * 2)
      );
      expect((await listToolsRaw(sessionId, shortLived.url)).status).toBe(
        NOT_FOUND
      );
    } finally {
      stop(shortLived.server);
    }
  });
});
