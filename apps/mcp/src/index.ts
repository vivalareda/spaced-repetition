/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

const APP_NAME = "Spaced Repetition App";
const APP_VERSION = "1.0.0";
const PORT = 3000;
const VALID_TOKEN = "this_is_a_test";
const AUTH_HEADER_PREFIX = "Bearer ";
const UNAUTHORIZED_STATUS = 401;
const RANDOM_MIN_DEFAULT = 0;
const RANDOM_MAX_DEFAULT = 100;

const mcpServer = new McpServer({
  name: APP_NAME,
  version: APP_VERSION,
});

mcpServer.tool(
  "generate_random_number",
  "Generate a random number between min and max",
  {
    min: z.number().describe("Minimum value"),
    max: z.number().describe("Maximum value"),
  },
  ({ min = RANDOM_MIN_DEFAULT, max = RANDOM_MAX_DEFAULT }) => {
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

const app = express();
app.use(express.json());

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
});

await mcpServer.connect(transport);

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith(AUTH_HEADER_PREFIX)) {
    res.status(UNAUTHORIZED_STATUS).send("Unauthorized");
    return;
  }

  const token = authHeader.substring(AUTH_HEADER_PREFIX.length);

  if (token !== VALID_TOKEN) {
    return res.status(UNAUTHORIZED_STATUS).json({ error: "Invalid token" });
  }

  next();
});

app.all("/mcp", async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
