<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { state as appState } from '$lib/state.svelte';
	import { ScrollArea } from './ui/scroll-area';

	interface ChatMessage {
		author: 'user' | 'ai';
		text: string;
	}

	let userCurrentMessage = $state<string>('');
	let messages = $state<ChatMessage[]>([]);

	interface Replay {
		text: string;
	}

	interface MissionAcomplished {
		result: string;
	}

	interface AiAssistant {
		sendMessage(): Promise<Replay | MissionAcomplished>;
	}

	interface Mission {
		get(): string;
	}

	interface State {
		addTodo(): void;
	}

	class ChromeAiAssistant implements AiAssistant {
		async sendMessage(): Promise<Replay | MissionAcomplished> {
			return { text: 'hi there' };
		}
	}

	class TodoAppMission implements Mission {
		get(): string {
			return 'I will talk to you in natural languagte. Your purpose is to understand my requests and then generate one of the following commands.';
		}
	}

	const chromAi = new ChromeAiAssistant(new TodoAppMission());

	interface StateApp {
		confirm: {
			before_delete: boolean;
			before_create: boolean;
		};
		description: {
			show: boolean;
		};
		priority: {
			show: boolean;
		};
		chat: {
			position: 'left' | 'right';
		};
	}

	function onChatMessage() {
		messages.push({
			author: 'user',
			text: userCurrentMessage
		});
		appState.chat.position = 'right';
	}
</script>

<Card.Root class="flex h-full flex-col">
	<Card.Header>
		<Card.Title>Chat with Theo</Card.Title>
		<Card.Description
			>Your personal AI assistant will help you use and configure the app</Card.Description
		>
	</Card.Header>
	<Card.Content class="min-h-0 flex-grow"
		><div class="h-full overflow-hidden">
			<ScrollArea class="h-full min-h-0 overflow-y-auto">
				{#each messages as aChatMessage}
					<b>{aChatMessage.author}</b>
					<p>{aChatMessage.text}</p>
				{/each}
			</ScrollArea>
		</div></Card.Content
	>
	<Card.Footer>
		<div class="flex w-full flex-col">
			<form on:submit={onChatMessage}>
				<div class="space-y-1">
					<Textarea
						class="w-full border-black"
						placeholder="Message Theo"
						bind:value={userCurrentMessage}
					/>
					<Button type="submit">Send</Button>
				</div>
			</form>
		</div>
	</Card.Footer>
</Card.Root>
