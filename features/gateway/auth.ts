import { validateApiKey, type ApiKey } from "../data/api-keys";

export function authenticateRequest(authHeader: string | null): ApiKey | null {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  return validateApiKey(match[1]);
}
