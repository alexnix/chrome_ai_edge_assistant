import type { Mission } from "./ai_assistant";

import {parse} from "$lib/dsl/gen/dsl.js"
import { appState } from "./app_state.svelte";

export class TodoAppMission implements Mission {
	getInstructions(): string {
		return `
You can use the following commands.

$ task "<name of the task>" with priority high/medium/low
Example: $ task "go to the gym tomorrow morning" with priority high

$ chat to the left/right
Example: $ chat to the right

A command always starts with a $ symbol. 
A reply with a command only contains the command and nothing else.
When you talk to me in natural language I appreciate if you always are breif and to the point.
		`;
	}

	isValidAttempt(message: string): boolean {
		return message.startsWith("$");
	}

	execute(command: string): void {
		const res = parse(command.replace("$", "").trim());
		switch(res.type) {
			case "task": 
				appState.todos.push({title: res.identifier, priority: res.priority});
				break;
			case "ui":
				appState.chat.position = res.position
				break;
		}
	}
}