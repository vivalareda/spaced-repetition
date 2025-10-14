import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const app = express();
app.use(express.json());

// Simple CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id");
  res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Create MCP server
const mcpServer = new McpServer({
  name: "flashcard-test-server",
  version: "1.0.0",
});

// Simple random number tool
mcpServer.tool(
  "generate_random_number",
  "Generate a random number between min and max",
  {
    min: z.number().describe("Minimum value"),
    max: z.number().describe("Maximum value"),
  },
  async ({ min, max }) => {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      content: [
        {
          type: "text",
          text: `Generated random number: ${randomNum}`,
        },
      ],
    };
  }
);

// Store active transports
const transports: Record<string, any> = {};

// Single endpoint: POST /mcp
app.post("/mcp", async (req: Request, res: Response) => {
  const body = req.body;
  const isInitRequest = body?.method === "initialize";

  let sessionId: string;
  let transport;

  if (isInitRequest) {
    // Create new session
    sessionId = uuidv4();

    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    });

    transport.sessionId = sessionId;
    transports[sessionId] = transport;

    // Connect to MCP server
    await mcpServer.connect(transport);

    // Set session ID in response
    res.setHeader("Mcp-Session-Id", sessionId);
  } else {
    // Use existing session
    sessionId = req.headers["mcp-session-id"] as string;
    transport = transports[sessionId];

    if (!transport) {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Session not found" },
        id: body?.id,
      });
    }
  }

  // Handle the request
  try {
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error" },
        id: body?.id,
      });
    }
  }
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    sessions: Object.keys(transports).length,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/mcp`);
});
