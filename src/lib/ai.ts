interface Replay {
	type: "Reply";
	stream: AiReplyStream;
}

interface MissionAcomplished {
	type: "MissionAcomplished",
	result: string;
}

interface AiError {
	type: "AiError",
	text: string;
}

interface AiAssistant {
	sendMessage(message: string): Promise<Replay | MissionAcomplished | AiError>;
}

interface Mission {
	get(): string;
}

interface State {
	addTodo(): void;
}

interface AiReplyStream extends ReadableStream<string> {
	[Symbol.asyncIterator]: () => Promise<string>;
}

interface ChromeAi {
	promptStreaming(message: string): Promise<AiReplyStream>;
	prompt(message: string): Promise<string>
}

declare global {
	interface Window {
		ai: {
			languageModel: {
				create(): Promise<ChromeAi>
			}
		}
	}
};

export class ChromeAiAssistant implements AiAssistant {
	private ai!: ChromeAi;

	private constructor(private readonly mission: Mission) {}

	private async init() {
		this.ai = await window.ai.languageModel.create();
		try {
			const initReply = await this.ai.prompt(this.mission.get());
			console.log("init success", initReply);
		} catch(e: unknown) {
			console.log("failed to init", e);
		}
	}

	public static async create() {
		const assistant = new ChromeAiAssistant(new TodoAppMission());
		await assistant.init();
		return assistant;
	}

	async sendMessage(message: string): Promise<Replay | MissionAcomplished | AiError> {

		try {
			console.log("promtion", message);
			const stream = await this.ai.promptStreaming(message);

			const reader = stream.getReader();
			const replyStart = await reader.read();

			console.log("replyStart", replyStart);

			if(replyStart.value?.trim().startsWith("$")) {
				console.log("executing a command");
				return {
					type: "MissionAcomplished",
					result: "I run a command"
				}
			} else {
				console.log("Forwarding the reply stream");
				reader.releaseLock();
				return {
					type: "Reply",
					stream
				}
			}
		
		} catch(e: unknown) {
			console.log(e);
			return {
				type: "AiError",
				text: (e as Error).message,
			}
		}



		// try {
		// 	console.log("promting: ", message);
		// 	const reply = await this.ai.prompt(message);
		// 	console.log(reply);
		// 	return {
		// 		text: reply
		// 	};
		// } catch(e: unknown) {
		// 	console.log(e);
		// 	return {
		// 		text: (e as Error).message,
		// 	}
		// }

	}
}

class TodoAppMission implements Mission {
	get(): string {
		return 'your mission is to reply briefly to all my questions/prompts';
	}
}
