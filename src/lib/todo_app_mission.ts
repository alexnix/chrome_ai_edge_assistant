import type { CoversationPromt, Mission } from "./ai_assistant";

import {parse} from "$lib/dsl/gen/dsl.js"
import { appState } from "./app_state.svelte";

enum CommandType {
	group_by = "group_by",
	chat = "chat",
	task = "task",
}

interface Command {
	type: CommandType,
}
interface GroupByCommand extends Command {
	type: CommandType.group_by
	column: "priority" | "none",
}

interface ChatCommand extends Command {
	type: CommandType.chat,
	position: "left" | "right"
}

interface TaskCommand extends Command {
	type: CommandType.task,
	identifier: string,
	priority: "low" | "medium" | "high",
}

type ParsedCommand = GroupByCommand | ChatCommand | TaskCommand;

export class TodoAppMission implements Mission {
	getInstructions(): string {
		return `
You can use the following commands.

1. $ task "<name of the task>" with priority high/medium/low
Example: $ task "go to the gym tomorrow morning" with priority high
Use it when I ask you to create one or more tasks for me.

2. $ chat to the left/right
Example: $ chat to the right
Use it when I ask you to move the chat.

3. $ display tasks by none/priority
Exampl: $ display tasks by none
Use it when I ask you to group/show/display my tasks.

A command always starts with a $ symbol. 
A reply with a command only contains the one ore more commands and nothing else.
When you talk to me in natural language I appreciate if you always are breif and to the point.
		`;
	}

	getExample(): CoversationPromt[] {
		return [
			{role: "user", content: "I want to read a book"},
			{role: "assistant", content: "What book would you like to read?"},
			{role: "user", content: "Clear Architecure, by Uncle Bob"},
			{role: "assistant", content: "Would you like me to create a task for you to read one chapter of this book every moring?"},
			{role: "user", content: "Yes, please"},
			{role: "assistant", content: `$ task "Read one chapter from Clean Archiecture in the morning" with priority medium`},
			{role: "user", content: "I have to create a demo application for Chrome AI, can you split this task in multiple steps?"},
			{role: "assistant", content: `
$ task "Research AI app ideas" with prioriy high
$ task "Validate the most interesting idea" with priority low
$ task "Code the demo app" with prioriry medium
				`},
			{role:"user", content:"The chat looks better on the rigt side"},
			{role: "assistant", content:"$ chat to the right"},
			{role: "user", content: "I want to read a programming book."},
			{role: "assistant", content: "Do you have any programming language or topic in mind?"},
			{role: "user", content: "Yes, a book about good programming practices; can you recommand me some?"},
			{role: "assistant", content: "For example, Clean Coder or The Pragmatic Progammer"},
			{role: "user", content: "The Pragmatic Progammer sounds like a good one, please add it to my task list"},
			{role: "assistant", content: `$ task "Read The Pragmatic Progammer" with priority medium`},
			{role: "user", content: "I would like to see the tasks grouped by priority"},
			{role: "assistant", content: "$ display tasks by priority"}
		]
	}

	isValidAttempt(message: string): boolean {
		return message.startsWith("$");
	}

	execute(commandBlock: string): number {	
		const commands = commandBlock
			.replaceAll('`', '')
			.split("$")
			.filter(cmd => cmd.length)
			.map(cmd => parse(cmd.trim()));

		commands.forEach(cmd => this.executeSingleCommand(cmd));

		return commands.length;
	}

	private executeSingleCommand(cmd: ParsedCommand) {
		console.log(cmd);
		switch(cmd.type) {
			case CommandType.task: 
				appState.todos.push({title: cmd.identifier, priority: cmd.priority});
				break;
			case CommandType.chat:
				appState.chat.position = cmd.position
				break;
			case CommandType.group_by:
				appState.groupBy = cmd.column
		}
	}
}