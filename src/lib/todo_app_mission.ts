import type { Mission } from "./ai_assistant";

import {parse} from "$lib/dsl/gen/dsl.js"

export class TodoAppMission implements Mission {
	getInstructions(): string {
		return `
			your mission is to reply briefly to all my questions/prompts; 
			if I ask you to move the chat to the right, simply reply with "$ chat right" and nothing else
		`;
	}

	isValidAttempt(message: string): boolean {
		return message.startsWith("$");
	}

	execute(command: string): void {
		
		const res = parse(command.replace("$", "").trim());
		console.log(res);	
	}
}