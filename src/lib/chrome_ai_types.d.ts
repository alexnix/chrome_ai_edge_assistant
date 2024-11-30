interface AiReplyStream extends ReadableStream<string> {
	[Symbol.asyncIterator](): AsyncGenerator<string>;
}

export interface ChromeBuiltinAi {
	promptStreaming(message: string): Promise<AiReplyStream>;
	prompt(message: string): void;
}

declare global {
	interface Window {
		ai: {
			languageModel: {
				create(): Promise<ChromeBuiltinAi>;
			};
		};
	}
}

export {};