import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel.js";
import type { ConvexHttpClient } from "convex/browser";
import { type ZodRawShape, type ZodTypeAny, z } from "zod";
import { findDeck, loadDecks } from "./card-views.js";
import { downloadImage } from "./image-download.js";
import { registerLibraryTools } from "./library-tools.js";
import { registerReviewTools } from "./review-tools.js";
import { registerTool, type ToolContext } from "./tool-helpers.js";

const APP_NAME = "Spaced Repetition App";
const APP_VERSION = "1.0.0";
const MIN_MCQ_OPTIONS = 2;

// Optional organization fields accepted by every card-creation tool.
const deckAndTagsInput = {
  deck: z
    .string()
    .optional()
    .describe("Name or id of an existing deck (see list_decks)"),
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
  // Persists the card from the validated tool arguments, with `deck` resolved
  // to the deck's exact name, and returns the new card id.
  create: (
    args: z.objectOutputType<Shape, ZodTypeAny>,
    context: ToolContext
  ) => Promise<string>;
};

function registerCardTool<Shape extends ZodRawShape>(
  server: McpServer,
  client: ConvexHttpClient,
  name: string,
  { title, description, cardKind, inputSchema, create }: CardToolConfig<Shape>
) {
  registerTool(server, client, name, {
    title,
    description,
    inputSchema,
    outputSchema: cardCreatedOutput,
    run: async (args, context) => {
      // The backend silently files cards with an unknown deck name under no
      // deck, so unknown decks are rejected here, and names matched ignoring
      // case.
      const deck =
        typeof args.deck === "string"
          ? findDeck(await loadDecks(context), args.deck).deckName
          : undefined;
      const id = await create({ ...args, deck }, context);
      return {
        id,
        message: `Successfully created ${cardKind} with ID: ${id}`,
      };
    },
  });
}

// ============================================
// Image uploads
// ============================================

const imageInput = z
  .object({
    url: z.string().url().optional().describe("Public https URL of the image"),
    base64: z.string().optional().describe("Base64 image data, or a data: URL"),
    mimeType: z
      .string()
      .optional()
      .describe(
        "e.g. image/png; required with base64 unless it is a data: URL"
      ),
  })
  .refine(
    (image) => (image.url === undefined) !== (image.base64 === undefined),
    {
      message: "Provide exactly one of url or base64",
    }
  );

type ImageInput = z.infer<typeof imageInput>;

const DATA_URL_PATTERN = /^data:([^;,]+);base64,(.*)$/s;

/** The image's bytes and declared type, downloaded or decoded. */
function loadImage(image: ImageInput) {
  if (image.url) {
    return downloadImage(image.url);
  }

  const dataUrl = DATA_URL_PATTERN.exec(image.base64 ?? "");
  const type = dataUrl?.[1] ?? image.mimeType;
  if (!type) {
    throw new Error("mimeType is required with base64 image data");
  }
  const bytes = Buffer.from(dataUrl?.[2] ?? image.base64 ?? "", "base64");
  return new Blob([bytes], { type });
}

/**
 * Stores images the way the web app's upload does, returning their storage
 * ids in order. Every image is downloaded and accepted by the backend (which
 * checks size and type, and checks the stored file again on card creation)
 * before any is uploaded, so a bad image doesn't leave the others orphaned.
 */
async function uploadImages(
  { client, apiKey }: ToolContext,
  images: (ImageInput | undefined)[]
) {
  const blobs = await Promise.all(
    images.map((image) => (image ? loadImage(image) : undefined))
  );
  const uploadUrls = await Promise.all(
    blobs.map((blob) =>
      blob
        ? client.mutation(api.cards.generateUploadUrl, {
            apiKey,
            fileSize: blob.size,
            fileType: blob.type,
          })
        : undefined
    )
  );
  const storageIds: (Id<"_storage"> | undefined)[] = [];
  for (const [index, blob] of blobs.entries()) {
    const uploadUrl = uploadUrls[index];
    if (!(blob && uploadUrl)) {
      storageIds.push(undefined);
      continue;
    }
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
    if (!response.ok) {
      throw new Error(`Image upload failed (HTTP ${response.status})`);
    }
    const { storageId } = (await response.json()) as {
      storageId: Id<"_storage">;
    };
    storageIds.push(storageId);
  }
  return storageIds;
}

// Each MCP session needs its own server instance: `McpServer.connect` binds a
// single transport, so sharing one server across sessions would misroute
// responses between concurrent clients.
export function createMcpServer(client: ConvexHttpClient) {
  const server = new McpServer({ name: APP_NAME, version: APP_VERSION });

  registerCardTool(server, client, "create_flashcard", {
    title: "Create Flashcard",
    description: "Create a question and answer flashcard for a user",
    cardKind: "flashcard",
    inputSchema: {
      question: z.string(),
      answer: z.string(),
      ...deckAndTagsInput,
    },
    create: (args, { apiKey }) =>
      client.mutation(api.cards.createQuestionCard, { ...args, apiKey }),
  });

  registerCardTool(server, client, "create_mcq_flashcard", {
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
    create: (args, { apiKey }) =>
      client.mutation(api.cards.createQuestionCard, { ...args, apiKey }),
  });

  registerCardTool(server, client, "create_code_flashcard", {
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
    create: (args, { apiKey }) =>
      client.mutation(api.cards.createCodeCard, { ...args, apiKey }),
  });

  registerCardTool(server, client, "create_image_flashcard", {
    title: "Create Image Flashcard",
    description:
      "Create a flashcard with an image on its question and/or answer side. Each image is given as a public https URL or as base64 data (PNG, JPEG or WebP, up to 5 MB, like web uploads).",
    cardKind: "image flashcard",
    inputSchema: {
      question: z.string().describe("Text shown with the question image"),
      answer: z.string().describe("Text shown with the answer image"),
      questionImage: imageInput.optional(),
      answerImage: imageInput.optional(),
      ...deckAndTagsInput,
    },
    create: async ({ questionImage, answerImage, ...args }, context) => {
      // Check the API key before downloading anything on the caller's behalf.
      await loadDecks(context);
      const [questionFile, answerFile] = await uploadImages(context, [
        questionImage,
        answerImage,
      ]);
      return await client.mutation(api.cards.createCard, {
        ...args,
        apiKey: context.apiKey,
        cardType: "image",
        questionFile,
        answerFile,
      });
    },
  });

  registerReviewTools(server, client);
  registerLibraryTools(server, client);

  return server;
}
