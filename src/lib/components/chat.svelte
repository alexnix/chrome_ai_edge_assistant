<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from './ui/scroll-area';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import Spinner from './ui/spinner.svelte';
	import LinearSpinner from './ui/linear_spinner.svelte';
	import type { AiAssistant } from '$lib/ai_assistant';
	import { CircleCheck } from 'lucide-svelte/icons';
	import Avatar from './ui/avatar/avatar.svelte';
	import { Fallback } from './ui/avatar';
	import { onMount } from 'svelte';

	interface ChatMessage {
		author: 'user' | 'ai' | 'system_error' | 'system_command';
		text: string;
		timestapm: number;
	}

	let scrollView: any;

	let userCurrentMessage = $state<string>('');
	let {
		messages = $bindable(),
		assistant,
		assistantAvailable
	}: {
		messages: ChatMessage[];
		assistant: AiAssistant | null;
		assistantAvailable: boolean;
	} = $props();
	let aiThiking = $state(false);

	function scrollChatToBottom() {
		// Use setTimeout to make sure the new messages have rendered already
		setTimeout(() => scrollView.scrollIntoView(false), 0);
	}

	function newMessage(message: Omit<ChatMessage, 'timestapm'>) {
		messages.push({
			...message,
			timestapm: Date.now()
		});
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

		newMessage({
			author: 'user',
			text: DOMPurify.sanitize(await marked.parse(userCurrentMessage))
		});

		scrollChatToBottom();

		const messageForAi = String(userCurrentMessage);
		userCurrentMessage = '';

		newMessage({
			author: 'ai',
			text: ''
		});

		const res = await assistant.sendMessage(messageForAi, {
			onError(message) {
				messages.pop();
				newMessage({
					author: 'system_error',
					text: message
				});
				aiThiking = false;
			},
			onMissionCompleted(numberOfExecutedCommands) {
				messages.pop();
				newMessage({
					author: 'system_command',
					text: String(numberOfExecutedCommands)
				});
				aiThiking = false;
			},
			async onReply(message) {
				messages[messages.length - 1].text = DOMPurify.sanitize(await marked.parse(message));
				scrollChatToBottom();
			},

			onMission() {},

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

	function getMessageDisplayName(author: string) {
		switch (author) {
			case 'user':
				return 'You';
			case 'ai':
				return 'Theo';
			default:
				return author;
		}
	}

	onMount(() => {
		scrollChatToBottom();
	});
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
		<Card.Title>
			<div class="flex flex-row items-center space-x-2">
				<Avatar>
					<Fallback>TH</Fallback>
				</Avatar>
				<div>
					Chat with Theo

					<Card.Description
						>Your personal AI assistant will help you use and configure the app</Card.Description
					>
				</div>
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content class="min-h-0 flex-grow"
		><div class="h-full overflow-hidden">
			<ScrollArea class="h-full min-h-0 overflow-y-auto">
				<div bind:this={scrollView} class="flex-col space-y-2">
					{#each messages as message}
						{@render singleChatMessage(message)}
					{/each}
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
	{#if message.author === 'system_command'}
		<div class="grid">
			<h5 class="pb-1 text-sm font-semibold leading-snug text-gray-900">Theo</h5>
			<div class="grid">
				<div
					class="inline-flex items-center justify-start gap-3 rounded-3xl rounded-tl-none bg-gray-100 px-3.5 py-2"
				>
					<h5 class="prose text-sm font-normal leading-snug text-gray-900">
						<div class="flex flex-row items-center space-x-2 font-semibold text-green-700">
							<CircleCheck class="w-4" />
							<small>Executed {message.text} command(s)</small>
						</div>
					</h5>
				</div>
				<div class="inline-flex items-center justify-end">
					<h6 class="py-1 text-xs font-normal leading-4 text-gray-500">05:14 PM</h6>
				</div>
			</div>
		</div>
	{:else}
		<div class="grid">
			<h5 class="pb-1 text-sm font-semibold leading-snug text-gray-900">
				{getMessageDisplayName(message.author)}
			</h5>
			<div class="grid">
				<div
					class="inline-flex items-center justify-start gap-3 rounded-3xl rounded-tl-none bg-gray-100 px-3.5 py-2"
				>
					{#if message.text === '' && aiThiking}
						<div class="w-full">
							<small class="text-gray-600">Thinking...</small>
							<LinearSpinner />
						</div>
					{:else}
						<h5 class="prose text-sm font-normal leading-snug text-gray-900">
							{@html message.text}
						</h5>
					{/if}
				</div>
				<div class="inline-flex items-center justify-end">
					<h6 class="py-1 text-xs font-normal leading-4 text-gray-500">
						{new Date(message.timestapm).toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit',
							hour12: true
						})}
					</h6>
				</div>
			</div>
		</div>
	{/if}
{/snippet}
