export interface ResultHandler {
	onReply(message: string): void;
	onError(message: string): void;
	onMission(message: string): void;
	onDone(): void;
	onMissionCompleted(): void;
}

export interface Mission {
	getInstructions(): string;
	isValidAttempt(message: string): boolean;
	execute(command: string): void;
}

export interface AiAssistantFactory {
	create(mission: Mission): Promise<AiAssistant>;
}

export interface AiAssistant {
	sendMessage(message: string, handler: ResultHandler): Promise<void>;
}
