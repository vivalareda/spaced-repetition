/** biome-ignore-all lint/suspicious/noConsole: <temporary> */
import { ConvexHttpClient } from "convex/browser";
import { config } from "dotenv";
import { createApp } from "./app.js";

config({ path: ".env.local" });

const DEFAULT_PORT = 3002;
const PORT = Number(process.env.PORT ?? DEFAULT_PORT);

if (!process.env.CONVEX_URL) {
  throw new Error("Missing env variable: CONVEX_URL");
}

createApp(new ConvexHttpClient(process.env.CONVEX_URL)).listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
