/**
 * In-memory file store for passing a File object between pages
 * during client-side navigation. Not persisted — if the user
 * refreshes the analyze page, this will be null and they'll be
 * redirected back to the landing page to re-upload.
 */
let pendingFile: File | null = null

export function setPendingFile(file: File): void {
  pendingFile = file
}

export function getPendingFile(): File | null {
  return pendingFile
}

export function clearPendingFile(): void {
  pendingFile = null
}
