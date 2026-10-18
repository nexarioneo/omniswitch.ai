export interface OpenAIRequest {
  model: string;
  messages?: Array<{ role: string; content: string; name?: string }>;
  prompt?: string;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: { role: string; content: string };
    text?: string;
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function generateId(prefix: string = "chatcmpl"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
