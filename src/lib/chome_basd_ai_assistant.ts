import { type AiAssistant, type AiAssistantFactory, type Mission, type ResultHandler } from "./ai_assistant";
import type { ChromeBuiltinAi } from "./chrome_ai_types";

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
		try {

			this.ai = await window.ai.languageModel.create({
				initialPrompts: [
					{ role: "system", content: this.mission.getInstructions() },
				    { role: "user", content: "I am hungy" },
					{ role: "assistant", content: "Do you want me to add a task for buying food?" },
					{ role: "user", content: "Yes pelase" },
					{ role: "assistant", content: `$ task "buy food" with priority medium` }
				]
			});

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
