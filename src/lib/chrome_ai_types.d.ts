interface AiLanguageModelReplyStream extends ReadableStream<string> {
	[Symbol.asyncIterator](): AsyncGenerator<string>;
}

type AILanguageModelPromptInput = string | AILanguageModelPrompt | AILanguageModelPrompt[];

type AILanguageModelInitialPromptRole = "system" | "user" | "assistant";
type AILanguageModelPromptRole = "user" | "assistant";

interface AILanguageModelInitialPrompt {
  role: AILanguageModelInitialPromptRole;
  content: string;
}

interface AILanguageModelPrompt {
  role: AILanguageModelPromptRole;
  content: string;
}

interface AILanguageModelPromptOptions {
  signal?: AbortSignal;
}

interface AILanguageModelCloneOptions {
  signal?: AbortSignal;
}

interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  monitor?: AICreateMonitorCallback;
  systemPrompt?: string;
  initialPrompts?: AILanguageModelInitialPrompt[];
  topK?: number;
  temperature?: number;
}

interface AILanguageModelCapabilities {
  available: AICapabilityAvailability;
  languageAvailable(languageTag: string): AICapabilityAvailability;
  defaultTopK?: number | null;
  maxTopK?: number | null;
  defaultTemperature?: number | null;
  maxTemperature?: number | null;
}

interface AILanguageModelFactory {
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
  capabilities(): Promise<AILanguageModelCapabilities>;
}

export interface AILanguageModel extends EventTarget {
  prompt(input: AILanguageModelPromptInput, options?: AILanguageModelPromptOptions): Promise<string>;
  promptStreaming(input: AILanguageModelPromptInput, options?: AILanguageModelPromptOptions): AiLanguageModelReplyStream;

  countPromptTokens(input: AILanguageModelPromptInput, options?: AILanguageModelPromptOptions): Promise<number>;

  readonly maxTokens: number;
  readonly tokensSoFar: number;
  readonly tokensLeft: number;

  readonly topK: number;
  readonly temperature: number;

  oncontextoverflow: ((this: AILanguageModel, ev: Event) => any) | null;

  clone(options?: AILanguageModelCloneOptions): Promise<AILanguageModel>;
  destroy(): void;
}

// Helper type for capabilities
type AICapabilityAvailability = "yes" | "no" | "unknown";

// Callback type for monitoring (not provided in the WebIDL snippet)
type AICreateMonitorCallback = (progress: any) => void;


declare global {
	interface Window {
		ai: {
			languageModel: AILanguageModelFactory;
		};
	}
}

export {};