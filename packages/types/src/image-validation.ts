export const KILOBYTE = 1024;
export const MEGABYTE = KILOBYTE * KILOBYTE;
export const MAX_IMAGE_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE = MAX_IMAGE_FILE_SIZE_MB * MEGABYTE;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Checks an image's size and MIME type against the upload limits. Accepts a
 * browser `File` as well as Convex's stored-file metadata, so the client and
 * server enforce identical rules with identical messages.
 */
export function validateImageFile(file: {
  size: number;
  type: string | undefined;
}): ImageValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / MEGABYTE}MB. Your file is ${(file.size / MEGABYTE).toFixed(2)}MB.`,
    };
  }

  if (file.type === undefined || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}
