export interface ResultHandler {
	onReply(message: string): void;
	onError(message: string): void;
	onMission(message: string): void;
	onDone(): void;
	onMissionCompleted(numberOfExecutedCommands: number): void;
}

export interface CoversationPromt {
	role: "user" | "assistant";
  	content: string;
}

export interface Mission {
	getInstructions(): string;
	getExample(): CoversationPromt[];
	isValidAttempt(message: string): boolean;
	execute(command: string): number;
}

export interface AiAssistantFactory {
	create(mission: Mission): Promise<AiAssistant>;
}

export interface AiAssistant {
	sendMessage(message: string, handler: ResultHandler): Promise<void>;
}
