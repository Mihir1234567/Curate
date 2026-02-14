/**
 * Centralized logging utility.
 * Logs are suppressed in production builds automatically.
 */
export const logError = (message: string, error?: unknown): void => {
  if (import.meta.env.DEV) {
    console.error(`[DEV] ${message}`, error ?? "");
  }
};
