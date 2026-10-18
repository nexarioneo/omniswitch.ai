import { z } from "zod";

export const chatCompletionSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant", "tool"]),
    content: z.string(),
    name: z.string().optional(),
  })).min(1),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().min(1).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),
  user: z.string().optional(),
});

export const completionSchema = z.object({
  model: z.string().min(1),
  prompt: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.number().int().min(1).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().min(1).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  logit_bias: z.record(z.string(), z.number()).optional(),
  user: z.string().optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1),
  rate_limit_type: z.enum(["token", "unlimited"]).optional(),
  rate_limit_value: z.number().int().positive().nullable().optional(),
  rate_limit_window: z.number().int().positive().optional(),
});

export const createProviderSchema = z.object({
  name: z.string().min(1),
  base_url: z.string().url(),
  auth_type: z.enum(["bearer", "header"]).optional(),
});

export const addProviderKeySchema = z.object({
  key: z.string().min(1),
  rotation_strategy: z.enum(["round_robin", "sequential", "random"]).optional(),
});

export const updateModelSchema = z.object({
  is_enabled: z.boolean(),
});

export const settingsSchema = z.object({
  gateway_name: z.string().min(1).max(100),
  default_rate_limit: z.number().int().min(0),
  log_retention_days: z.number().int().min(1).max(3650),
});

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(200),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionSchema>;
export type CompletionRequest = z.infer<typeof completionSchema>;
