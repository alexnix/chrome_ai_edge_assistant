import { type AiAssistant, type AiAssistantFactory, type Mission, type ResultHandler } from "./ai_assistant";
import type { AILanguageModel } from "./chrome_ai_types";
import { SyntaxError } from "./dsl/gen/dsl";

export class ChromeBasedAiAssistantFactory implements AiAssistantFactory {
    async create(mission: Mission): Promise<AiAssistant> {
        const assistant = new ChromeBasedAiAssistant(mission);
		await assistant.init();
		return assistant;
    }
}

export class ChromeBasedAiAssistant implements AiAssistant {
	private ai!: AILanguageModel;
	private feedbackLoopCount = 0;
	public static readonly MAX_FEEDBACK_LOOP_ITERATIONS = 3;

	constructor(private readonly mission: Mission) { }

	async init(): Promise<void> {
		try {

			this.ai = await window.ai.languageModel.create({
				initialPrompts: [
					{ role: "system", content: this.mission.getInstructions() },
				    ...this.mission.getExample(),
				]
			});

		} catch (e: unknown) {
			console.log('failed to init', e);
		}
	}

	async sendMessage(message: string, hander: ResultHandler): Promise<void> {
		console.log('Prompt: ', message);
		this.feedbackLoopCount = 0;

		try {
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
				const numberOfExecutedCommands = this.mission.execute(fullResponse);
				hander.onMissionCompleted(numberOfExecutedCommands);
			} else {
				hander.onDone();
			}
		} catch (e: unknown) {
			console.log(e);
			if(e instanceof SyntaxError) {
				console.log("Try to self correct: ", e.format());
				await this.attemptFeedbackLoop(e.format(), hander);
			} else {
				hander.onError((e as Error).message)
			}
		}
	}

	private async attemptFeedbackLoop(errorMessage: string, hander: ResultHandler) {
		if(++this.feedbackLoopCount > ChromeBasedAiAssistant.MAX_FEEDBACK_LOOP_ITERATIONS) {
			hander.onError("The model faield to generate valid command to fulfil your request.");
			return;
		}

		const res = await this.ai.prompt(errorMessage);
		// The model tends to apologies when feedback is given
		// So just ignore whatever comes before the $
		const [_modelApology, ...rest] = res.split("$");
		try {
			const numberOfExecutedCommands = this.mission.execute(rest.join("\n"));
			hander.onMissionCompleted(numberOfExecutedCommands);
		}  catch (e: unknown) {
			console.log(e);
			if(e instanceof SyntaxError) {
				console.log("Try to self correct: ", e.format());
				await this.attemptFeedbackLoop(e.format(), hander);
			} else {
				hander.onError((e as Error).message)
			}
		}
	}
}
