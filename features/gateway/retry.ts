const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

export function shouldRetry(status: number, attempt: number): boolean {
  return attempt < MAX_RETRIES && RETRYABLE_STATUS.has(status);
}

export function getRetryDelay(attempt: number): number {
  return BASE_DELAY * Math.pow(2, attempt - 1);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
