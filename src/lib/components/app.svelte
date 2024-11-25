<script>
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import Check from 'lucide-svelte/icons/check';
	import Trash from 'lucide-svelte/icons/trash';
	import Elipsis from 'lucide-svelte/icons/ellipsis';
	import { Badge } from '$lib/components/ui/badge';
</script>

<div class="prose">
	<Card.Root>
		<Card.Content>
			<h2 class="mt-0">Todo app</h2>
			{#each Array(5) as _}
				<Separator class="my-2" />
				{@render todo_item()}
			{/each}
		</Card.Content>
	</Card.Root>
</div>

{#snippet todo_item()}
	<div class="flex flex-row">
		<div class="flex flex-grow flex-col">
			<div><Badge variant="default">High Priority</Badge></div>
			<span>hello</span>
			<small>description here</small>
		</div>

		<div>
			<Button size="icon" variant="outline">
				<Elipsis />
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
