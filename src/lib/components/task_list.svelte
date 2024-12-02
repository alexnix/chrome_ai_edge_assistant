<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import {Check, Trash, Ellipsis} from 'lucide-svelte/icons';
	import { Badge } from '$lib/components/ui/badge';
	import type { Todo } from '$lib/app_state.svelte';

    let {tasks, title}: {
        tasks: Todo[],
        title: string,
    } = $props();
</script>

<div class="prose">
	<Card.Root>
		<Card.Content>
			<h2 class="mt-0">{title}</h2>
			{#if tasks.length === 0}
				<div class="bg-gray-00 text-gray-500 rounded-md">There are no tasks here. You can use the chat with Thoe to come up with tasks and Theo will add them here.</div>
			{/if}
			{#each tasks as item, index}
				{#if ![0, tasks.length].includes(index)}
					<Separator class="my-2" />
				{/if}
				{@render todo_item(item)}
			{/each}
		</Card.Content>
	</Card.Root>
</div>

{#snippet todo_item(item: Todo)}
	<div class="flex flex-row">
		<div class="flex flex-grow flex-col">
			<div><Badge variant="default">{item.priority} priority</Badge></div>
			<span>{item.title}</span>
			<small>{item.description}</small>
		</div>

		<div>
			<Button size="icon" variant="outline">
				<Ellipsis />
			</Button>
			<Button size="icon" variant="outline">
				<Check />
			</Button>
			<Button size="icon" variant="outline">
				<Trash />
			</Button>
		</div>
	</div>
{/snippet}
