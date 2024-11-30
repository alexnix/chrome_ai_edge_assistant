import { type AiAssistant, type AiAssistantFactory, type Mission, type ResultHandler } from "./ai_assistant";
import type { ChromeBuiltinAi } from "./chrome_ai_types";
import { state } from "./state.svelte";

export class ChromeBasedAiAssistantFactory implements AiAssistantFactory {
    async create(mission: Mission): Promise<AiAssistant> {
        const assistant = new ChromeBasedAiAssistant(mission);
		await assistant.init();
		return assistant;
    }
}

export class ChromeBasedAiAssistant implements AiAssistant {
	private ai!: ChromeBuiltinAi;

	constructor(private readonly mission: Mission) { }

	async init(): Promise<void> {
		this.ai = await window.ai.languageModel.create();
		try {
			const initReply = await this.ai.prompt(this.mission.getInstructions());
			console.log('init success', initReply);
		} catch (e: unknown) {
			console.log('failed to init', e);
		}
	}

	async sendMessage(message: string, hander: ResultHandler): Promise<void> {
		try {
			console.log('prompt', message);
			const stream = await this.ai.promptStreaming(message);
			let fullResponse = "";

			for await (const chunk of stream) {
				console.log('chat: ', chunk.trim());
				fullResponse = chunk.trim();
				if(this.mission.isValidAttempt(fullResponse)) {
					hander.onMission(fullResponse);
				} else {
					hander.onReply(fullResponse);
				}
			}

			if(this.mission.isValidAttempt(fullResponse)) {
				this.mission.execute(fullResponse);
				hander.onMissionCompleted();
			} else {
				hander.onDone();
			}
		} catch (e: unknown) {
			console.log(e);
			hander.onError((e as Error).message)
		}
	}
}
