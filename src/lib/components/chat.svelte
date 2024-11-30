<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from './ui/scroll-area';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import Spinner from './ui/spinner.svelte';
	import LinearSpinner from './ui/linear_spinner.svelte';
	import { TodoAppMission } from '$lib/todo_app_mission';
	import type { AiAssistant } from '$lib/ai_assistant';
	import { ChromeBasedAiAssistantFactory } from '$lib/chome_basd_ai_assistant';

	interface ChatMessage {
		author: 'user' | 'ai' | 'system_error' | 'system_command';
		text: string;
	}

	let scrollView: any;

	let userCurrentMessage = $state<string>('');
	let messages = $state<ChatMessage[]>([]);
	let assistant = $state<AiAssistant | null>(null);
	let assistantAvailable = $state<boolean>(false);
	let aiThiking = $state(false);

	onMount(async () => {
		const aiAssistantFactory = new ChromeBasedAiAssistantFactory();
		assistant = await aiAssistantFactory.create(new TodoAppMission());
		assistantAvailable = true;
	});

	function scrollChatToBottom() {
		// Use setTimeout to make sure the new messages have rendered already
		setTimeout(() => scrollView.scrollIntoView(false), 0);
	}

	async function onChatMessage() {
		if (!assistant) {
			return;
		}

		if (aiThiking) {
			alert('Ai is thiking. Cannot send message.');
			return;
		}

		aiThiking = true;

		messages.push({
			author: 'user',
			text: DOMPurify.sanitize(await marked.parse(userCurrentMessage))
		});

		scrollChatToBottom();

		const messageForAi = String(userCurrentMessage);
		userCurrentMessage = '';

		messages.push({
			author: 'ai',
			text: ''
		});
		
		const res = await assistant.sendMessage(messageForAi, {
			onError(message) {
				messages.pop();
				messages.push({
					author: 'system_error',
					text: message
				});
				aiThiking = false;
			},
			onMissionCompleted() {
				messages.pop();
				messages.push({
					author: "system_command",
					text: "",
				});
				aiThiking = false;
			},
			async onReply(message) {
				messages[messages.length - 1].text = DOMPurify.sanitize(await marked.parse(message));
				scrollChatToBottom();
			},

			onMission() {

			},

			onDone() {
				aiThiking = false;
			}
		});
	}

	function onTextareaKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onChatMessage();
		}
	}
</script>

<Card.Root class="relative flex h-full flex-col overflow-hidden">
	{#if !window.ai || !window.ai.languageModel || !assistantAvailable}
		<div
			class="text-bold absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center space-y-2 bg-gray-500 text-center text-white opacity-90"
		>
			{#if !window.ai || !window.ai.languageModel}
				<p>Your browser does not support AI</p>
			{/if}
			{#if !assistantAvailable}
				<p>Asistant is loading</p>
				<Spinner />
			{/if}
		</div>
	{/if}

	<Card.Header>
		<Card.Title>Chat with Theo</Card.Title>
		<Card.Description
			>Your personal AI assistant will help you use and configure the app</Card.Description
		>
	</Card.Header>
	<Card.Content class="min-h-0 flex-grow"
		><div class="h-full overflow-hidden">
			<ScrollArea class="h-full min-h-0 overflow-y-auto">
				<div bind:this={scrollView} class="flex-col space-y-2">
					{#each messages as message}
						{@render singleChatMessage(message)}
					{/each}
					{#if aiThiking}
						<div>
							<small class="text-gray-600">Thinking...</small>
							<LinearSpinner />
						</div>
					{/if}
				</div>
			</ScrollArea>
		</div></Card.Content
	>
	<Card.Footer>
		<div class="flex w-full flex-col">
			<form onsubmit={onChatMessage}>
				<div class="space-y-1">
					<Textarea
						onkeydown={onTextareaKeydown}
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

{#snippet singleChatMessage(message: ChatMessage)}
	<div>
		<b>{message.author}</b>
		{#if message.text}
			<p class="prose">{@html message.text}</p>
		{/if}
	</div>
{/snippet}
