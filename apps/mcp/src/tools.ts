import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import type { ConvexHttpClient } from "convex/browser";
import { type ZodRawShape, type ZodTypeAny, z } from "zod";

const APP_NAME = "Spaced Repetition App";
const APP_VERSION = "1.0.0";
const AUTH_HEADER_PREFIX = "Bearer ";
const MIN_MCQ_OPTIONS = 2;

/** Returns the API key from an `Authorization: Bearer <key>` header, if any. */
export function parseBearerToken(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith(AUTH_HEADER_PREFIX)) {
    return;
  }
  return value.substring(AUTH_HEADER_PREFIX.length);
}

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

type CardToolConfig<Shape extends ZodRawShape> = {
  title: string;
  description: string;
  // Used in the success message, e.g. "code flashcard".
  cardKind: string;
  inputSchema: Shape;
  // Persists the card from the validated tool arguments plus the caller's
  // API key, and returns the new card id.
  create: (
    args: z.objectOutputType<Shape, ZodTypeAny> & {
      apiKey: string;
    }
  ) => Promise<string>;
};

function registerCardTool<Shape extends ZodRawShape>(
  server: McpServer,
  name: string,
  { title, description, cardKind, inputSchema, create }: CardToolConfig<Shape>
) {
  // Registered against the erased `ZodRawShape` because the SDK's callback type
  // cannot be resolved for a generic `Shape`; the SDK has validated `args`
  // against `inputSchema` before the callback runs.
  server.registerTool<ZodRawShape, typeof cardCreatedOutput>(
    name,
    {
      title,
      description,
      inputSchema,
      outputSchema: cardCreatedOutput,
    },
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

      const id = await create({
        ...(args as z.objectOutputType<Shape, ZodTypeAny>),
        apiKey,
      });
      const output = {
        id,
        message: `Successfully created ${cardKind} with ID: ${id}`,
      };
      return {
        content: [{ type: "text" as const, text: JSON.stringify(output) }],
        structuredContent: output,
      };
    }
  );
}

// Each MCP session needs its own server instance: `McpServer.connect` binds a
// single transport, so sharing one server across sessions would misroute
// responses between concurrent clients.
export function createMcpServer(client: ConvexHttpClient) {
  const server = new McpServer({ name: APP_NAME, version: APP_VERSION });

  registerCardTool(server, "create_flashcard", {
    title: "Create Flashcard",
    description: "Create a question and answer flashcard for a user",
    cardKind: "flashcard",
    inputSchema: {
      question: z.string(),
      answer: z.string(),
      ...deckAndTagsInput,
    },
    create: (args) => client.mutation(api.cards.createQuestionCard, args),
  });

  registerCardTool(server, "create_mcq_flashcard", {
    title: "Create MCQ flashcard",
    description:
      "Create a multiple-choice flashcard for the user with options and a correct answer index",
    cardKind: "MCQ flashcard",
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
    create: (args) => client.mutation(api.cards.createQuestionCard, args),
  });

  registerCardTool(server, "create_code_flashcard", {
    title: "Create Code Flashcard",
    description:
      "Create a coding flashcard with a code snippet and optional solution code",
    cardKind: "code flashcard",
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
    create: (args) => client.mutation(api.cards.createCodeCard, args),
  });

  return server;
}
