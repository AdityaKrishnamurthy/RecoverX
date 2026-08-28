import { createXai } from "@ai-sdk/xai";
import { createMistral } from "@ai-sdk/mistral";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModel } from "ai";

export type LLMProviderName = "grok" | "mistral" | "gemini" | "deterministic";

export interface ExecutionResult<T> {
  result: T;
  provider: LLMProviderName;
  modelName: string;
  latencyMs: number;
  attempts: { provider: LLMProviderName; success: boolean; error?: string }[];
}

export function getProviderModel(provider: LLMProviderName): { model: LanguageModel; modelName: string } {
  switch (provider) {
    case "grok": {
      const apiKey = process.env.XAI_API_KEY || "";
      const xai = createXai({ apiKey });
      const modelName = "grok-2-1212";
      return { model: xai(modelName) as LanguageModel, modelName };
    }
    case "mistral": {
      const apiKey = process.env.MISTRAL_API_KEY || "";
      const mistral = createMistral({ apiKey });
      const modelName = "mistral-large-latest";
      return { model: mistral(modelName) as LanguageModel, modelName };
    }
    case "gemini": {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
      const google = createGoogleGenerativeAI({ apiKey });
      const modelName = "gemini-1.5-flash";
      return { model: google(modelName) as LanguageModel, modelName };
    }
    default:
      throw new Error(`Unsupported external LLM provider: ${provider}`);
  }
}

/**
 * Executes an AI task using a resilient fallback chain:
 * Grok -> Mistral -> Gemini -> Deterministic Expert Rules (Safety Fallback)
 */
export async function executeWithFallback<T>(
  taskRunner: (model: LanguageModel, provider: LLMProviderName, modelName: string) => Promise<T>,
  deterministicFallback: () => T,
  preferredOrder: LLMProviderName[] = ["grok", "mistral", "gemini"]
): Promise<ExecutionResult<T>> {
  const attempts: { provider: LLMProviderName; success: boolean; error?: string }[] = [];
  const start = Date.now();

  for (const provider of preferredOrder) {
    if (provider === "deterministic") {
      const latencyMs = Date.now() - start;
      attempts.push({ provider: "deterministic", success: true });
      return {
        result: deterministicFallback(),
        provider: "deterministic",
        modelName: "finops-rule-agent-v1",
        latencyMs,
        attempts,
      };
    }

    try {
      const { model, modelName } = getProviderModel(provider);
      const result = await taskRunner(model, provider, modelName);
      const latencyMs = Date.now() - start;

      attempts.push({ provider, success: true });
      return {
        result,
        provider,
        modelName,
        latencyMs,
        attempts,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      attempts.push({ provider, success: false, error: errorMsg });
      // Keep warnings concise
      if (process.env.DEBUG_AI) {
        console.warn(`[LLM Fallback] Provider '${provider}' failed:`, errorMsg);
      }
    }
  }

  // If all live providers fail, execute deterministic safety fallback
  const latencyMs = Date.now() - start;
  attempts.push({ provider: "deterministic", success: true });
  return {
    result: deterministicFallback(),
    provider: "deterministic",
    modelName: "finops-rule-agent-v1",
    latencyMs,
    attempts,
  };
}
