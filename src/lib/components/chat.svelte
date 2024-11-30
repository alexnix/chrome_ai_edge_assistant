<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from './ui/scroll-area';
	import { ChromeAiAssistant } from '$lib/ai';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import Spinner from './spinner.svelte';

	interface ChatMessage {
		author: 'user' | 'ai';
		text: string;
	}

	let userCurrentMessage = $state<string>('');
	let messages = $state<ChatMessage[]>([]);
	let assistant = $state<ChromeAiAssistant | null>(null);
	let assistantAvailable = $state<boolean>(false);
	onMount(async () => {
		assistant = await ChromeAiAssistant.create();
		assistantAvailable = true;
	});

	// TODO call on enter 
	async function onChatMessage() {
		messages.push({
			author: 'user',
			text: DOMPurify.sanitize(await marked.parse(userCurrentMessage))
		});

		if (!assistant) {
			alert('Ai assistant is not ready');
			return;
		}

		const messageForAi = String(userCurrentMessage);
		userCurrentMessage = '';
		const res = await assistant.sendMessage(messageForAi);

		if(res.type === "Reply") {
			messages.push({
				author: "ai",
				text: "",
			});
			for await (const chunk of res.stream) {
				console.log("chat: ", chunk.trim());
				const fullResponse = chunk.trim();
				messages[messages.length - 1].text = DOMPurify.sanitize(await marked.parse(fullResponse));
				// TODO scroll the chat
			}
		}
	}
</script>

<Card.Root class="relative flex h-full flex-col overflow-hidden">
	{#if !window.ai || !window.ai.languageModel || !assistantAvailable}
		<div
			class="text-bold absolute left-0 top-0 flex h-full w-full items-center flex-col space-y-2 justify-center bg-gray-500 text-center text-white opacity-90"
		>
			{#if !window.ai || !window.ai.languageModel}
				<p>Your browser does not support AI</p>
			{/if}
			{#if !assistantAvailable}
				<p>Asistant is loading</p>
				<Spinner/>
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
				{#each messages as message}
					{@render singleChatMessage(message)}
				{/each}
			</ScrollArea>
		</div></Card.Content
	>
	<Card.Footer>
		<div class="flex w-full flex-col">
			<form onsubmit={onChatMessage}>
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

{#snippet singleChatMessage(message: ChatMessage)}
	<b>{message.author}</b>
	<p>{@html message.text}</p>
{/snippet}
