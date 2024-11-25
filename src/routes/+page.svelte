<script>
	import Chat from '$lib/components/chat.svelte';
	import App from '$lib/components/app.svelte';
	import { state as appState } from '$lib/state.svelte';
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
		<Chat />
	</div>
{/snippet}
