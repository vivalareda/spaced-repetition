import type { Doc } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel";

// ============================================
// Card Types
// ============================================
export type Card = Doc<"cards">;
export type Deck = Doc<"decks">;
export type ApiKey = Doc<"apiKeys">;
export type Difficulty = "easy" | "medium" | "hard" | "again";

export type TextCard = Omit<
  Card,
  `question${"Code" | "File"}` | `answer${"Code" | "File"}`
>;

export type CodeCard = Required<Omit<Card, "questionFile" | "answerFile">>;
export type ImageCard = Required<Omit<Card, "questionCode" | "answerCode">>;

// ============================================
// Form Types
export type {
  CodeFormData,
  FormDataType,
  ImageFormData,
  TextFormData,
} from "./src/form-data.ts";
// ============================================

// ============================================
// Image Validation
// ============================================
export const KILOBYTE = 1024;
export const MEGABYTE = KILOBYTE * KILOBYTE;
export const MAX_IMAGE_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE = MAX_IMAGE_FILE_SIZE_MB * MEGABYTE;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateImageFile(file: File): ImageValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / MEGABYTE}MB. Your file is ${(file.size / MEGABYTE).toFixed(2)}MB.`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

// ============================================
// Constants
// ============================================
export const MINIMUM_DEBOUNCE_TIME = 300;
export const QUESTION_TYPES = ["text", "code", "image"] as const;

// ============================================
// Type Guards
// ============================================
export const isCodeCard = (c: Card): c is CodeCard =>
  c.questionCode !== undefined || c.answerCode !== undefined;

export const isImageCard = (c: Card): c is ImageCard =>
  c.questionFile !== undefined || c.answerFile !== undefined;

export const isTextCard = (c: Card): c is TextCard =>
  !(isCodeCard(c) && isImageCard(c));
