// Server-Sent Events formatting for OpenAI-compatible streaming responses.

export function formatSSE(chunk: string): string {
  return `data: ${chunk}\n\n`;
}

export function formatSSEDone(): string {
  return "data: [DONE]\n\n";
}
