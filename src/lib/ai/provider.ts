import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModel } from "ai";

export type LLMProviderName = "groq" | "mistral" | "nvidia" | "gemini" | "deterministic";

export interface ExecutionResult<T> {
  result: T;
  provider: LLMProviderName;
  modelName: string;
  latencyMs: number;
  attempts: { provider: LLMProviderName; success: boolean; error?: string }[];
}

export function getProviderModel(provider: LLMProviderName): { model: LanguageModel; modelName: string } {
  switch (provider) {
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY || "";
      if (!apiKey || apiKey.length < 20) {
        throw new Error("Groq API key not configured");
      }
      const groq = createGroq({ apiKey });
      const modelName = "openai/gpt-oss-20b";
      return { model: groq(modelName) as LanguageModel, modelName };
    }
    case "mistral": {
      const apiKey = process.env.MISTRAL_API_KEY || "";
      if (!apiKey || apiKey === "..." || apiKey.length < 20) {
        throw new Error("Mistral API key not configured");
      }
      const mistral = createMistral({ apiKey });
      const modelName = "mistral-small-latest";
      return { model: mistral(modelName) as LanguageModel, modelName };
    }
    case "nvidia": {
      const apiKey = process.env.NVIDIA_API_KEY || "";
      if (!apiKey || apiKey.length < 20) {
        throw new Error("NVIDIA API key not configured");
      }
      // NVIDIA NIM exposes an OpenAI-compatible chat completions endpoint.
      const nvidia = createOpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });
      const modelName = "nvidia/nemotron-3-nano-30b-a3b";
      return { model: nvidia(modelName) as LanguageModel, modelName };
    }
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey || apiKey === "..." || apiKey.length < 20) {
        throw new Error("Google Gemini API key not configured");
      }
      const google = createGoogleGenerativeAI({ apiKey });
      const modelName = "gemini-3.6-flash";
      return { model: google(modelName) as LanguageModel, modelName };
    }
    default:
      throw new Error(`Unsupported external LLM provider: ${provider}`);
  }
}

/**
 * Executes an AI task using a resilient fallback chain, ordered by measured
 * latency/reliability (Groq ~0.2-0.9s, Mistral ~0.6s, NVIDIA ~0.7s, Gemini
 * 10-20s+ and prone to 503s under load — kept last as a safety net):
 * Groq -> Mistral -> NVIDIA -> Gemini -> Deterministic Expert Rules
 */
export async function executeWithFallback<T>(
  taskRunner: (model: LanguageModel, provider: LLMProviderName, modelName: string) => Promise<T>,
  deterministicFallback: () => T,
  preferredOrder: LLMProviderName[] = ["groq", "mistral", "nvidia", "gemini"]
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
