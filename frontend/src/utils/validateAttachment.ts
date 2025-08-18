export const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'png',
  'jpg',
  'jpeg',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export function getFileExtension(filename: string): string | null {
  const match = /\.([^.]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : null;
}

export function isAllowedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return !!ext && (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function allowedExtensionsLabel(): string {
  return ALLOWED_EXTENSIONS.join(', ');
}

/** Validate by extension + size (<=10 MB). */
export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

export function isWithinSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function validateAttachment(
  file: File,
): { ok: true } | { ok: false; message: string } {
  if (!isAllowedExtension(file.name)) {
    return {
      ok: false,
      message: `Unsupported file type. Allowed: ${allowedExtensionsLabel()}.`,
    };
  }
  if (!isWithinSize(file)) {
    return {
      ok: false,
      message: `File is too large (${formatBytes(
        file.size,
      )}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`,
    };
  }
  return { ok: true };
}
