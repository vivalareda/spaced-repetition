// Package entry point: re-exports the shared modules under `src/`.
// biome-ignore-all lint/performance/noBarrelFile: this is the package's public API

// ============================================
// Form Types
// ============================================
export type {
  CardType,
  CodeFormData,
  FormDataType,
  ImageFormData,
  McqFormData,
  TextFormData,
} from "./src/form-data";
export {
  CARD_TYPES,
  changeCardType,
  emptyCardForm,
  patchCardForm,
  toCardInput,
} from "./src/form-data";

// ============================================
// Image Validation
// ============================================
export type { ImageValidationResult } from "./src/image-validation";
export {
  ALLOWED_IMAGE_TYPES,
  KILOBYTE,
  MAX_FILE_SIZE,
  MAX_IMAGE_FILE_SIZE_MB,
  MEGABYTE,
  validateImageFile,
} from "./src/image-validation";

// ============================================
// Review sessions
// ============================================
export type { ReviewQueue } from "./src/review-queue";
export { completeReview, startReviewQueue } from "./src/review-queue";

// ============================================
// Scheduling
// ============================================
export type {
  Difficulty,
  ScheduleResult,
  SchedulingState,
} from "./src/scheduler";
export {
  INITIAL_SCHEDULING_STATE,
  RATINGS,
  schedule,
} from "./src/scheduler";
