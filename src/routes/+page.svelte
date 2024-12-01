<script lang="ts">
	import Chat from '$lib/components/chat.svelte';
	import App from '$lib/components/app.svelte';
	import { appState } from '$lib/app_state.svelte';
	import type { AiAssistant } from '$lib/ai_assistant';
	import { onMount } from 'svelte';
	import { ChromeBasedAiAssistantFactory } from '$lib/chome_basd_ai_assistant';
	import { TodoAppMission } from '$lib/todo_app_mission';

	interface ChatMessage {
		author: 'user' | 'ai' | 'system_error' | 'system_command';
		text: string;
	}

	let messages = $state<ChatMessage[]>([]);
	let assistant = $state<AiAssistant | null>(null);
	let assistantAvailable = $state<boolean>(false);

	onMount(async () => {
		const aiAssistantFactory = new ChromeBasedAiAssistantFactory();
		assistant = await aiAssistantFactory.create(new TodoAppMission());
		assistantAvailable = true;
	});
</script>

<div class="flex h-screen flex-row space-x-5 bg-gray-300 p-5">
	{#if appState.chat.position === 'right'}
		{@render app()}
		{@render chat()}
	{/if}
	{#if appState.chat.position === 'left'}
		{@render chat()}
		{@render app()}
	{/if}
</div>

{#snippet app()}
	<div class="w-3/4">
		<App />
	</div>
{/snippet}

{#snippet chat()}
	<div class="w-1/4">
		<Chat bind:messages {assistant} {assistantAvailable} />
	</div>
{/snippet}
