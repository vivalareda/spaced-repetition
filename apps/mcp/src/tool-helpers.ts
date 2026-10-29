import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { ConvexHttpClient } from "convex/browser";
import type { ZodRawShape, ZodTypeAny, z } from "zod";

const AUTH_HEADER_PREFIX = "Bearer ";

/** Returns the API key from an `Authorization: Bearer <key>` header, if any. */
export function parseBearerToken(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith(AUTH_HEADER_PREFIX)) {
    return;
  }
  return value.substring(AUTH_HEADER_PREFIX.length);
}

/** What every tool runs with: the backend, and the caller's API key. */
export type ToolContext = {
  client: ConvexHttpClient;
  apiKey: string;
};

// Errors thrown by Convex functions reach the client wrapped in request
// details and a stack trace; the assistant only needs the reason.
const UNCAUGHT_ERROR_PATTERN = /Uncaught Error: (.+)/;
const ARGUMENT_ERROR_PATTERN = /ArgumentValidationError: (.+)/;

/** A short, user-presentable message for an error thrown by a tool. */
export function toolErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const uncaught = UNCAUGHT_ERROR_PATTERN.exec(message);
  if (uncaught?.[1]) {
    return uncaught[1];
  }
  const invalidArgument = ARGUMENT_ERROR_PATTERN.exec(message);
  if (invalidArgument?.[1]) {
    return `Invalid argument: ${invalidArgument[1]}`;
  }
  return message;
}

type ToolConfig<Shape extends ZodRawShape> = {
  title: string;
  description: string;
  inputSchema: Shape;
  outputSchema?: ZodRawShape;
  annotations?: ToolAnnotations;
  /** Runs the tool from its validated arguments; the result is sent as JSON. */
  run: (
    args: z.objectOutputType<Shape, ZodTypeAny>,
    context: ToolContext
  ) => Promise<Record<string, unknown>>;
};

/**
 * Registers a tool that acts on behalf of the caller's API key. Its result is
 * returned both as structured content and as JSON text; errors are returned
 * as tool errors with a short message the assistant can relay.
 */
export function registerTool<Shape extends ZodRawShape>(
  server: McpServer,
  client: ConvexHttpClient,
  name: string,
  {
    title,
    description,
    inputSchema,
    outputSchema,
    annotations,
    run,
  }: ToolConfig<Shape>
) {
  // Registered against the erased `ZodRawShape` because the SDK's callback type
  // cannot be resolved for a generic `Shape`; the SDK has validated `args`
  // against `inputSchema` before the callback runs.
  server.registerTool<ZodRawShape, ZodRawShape>(
    name,
    { title, description, inputSchema, outputSchema, annotations },
    async (args, extra) => {
      // The HTTP layer already rejects requests without a bearer token; this
      // guards tool calls that reach the server some other way.
      const apiKey = parseBearerToken(
        (extra.requestInfo?.headers as { authorization?: string | string[] })
          ?.authorization
      );
      if (!apiKey) {
        throw new Error("Not authenticated");
      }

      try {
        const output = await run(
          args as z.objectOutputType<Shape, ZodTypeAny>,
          { client, apiKey }
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(output) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: toolErrorMessage(error) }],
          isError: true,
        };
      }
    }
  );
}
