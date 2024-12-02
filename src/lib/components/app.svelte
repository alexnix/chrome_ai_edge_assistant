<script lang="ts">
	import { appState } from '$lib/app_state.svelte';
	import TaskList from './task_list.svelte';
</script>

{#if appState.groupBy === 'priority'}
	<div class="flex flex-row space-x-2">
		<div class="w-1/3">
			<TaskList
				title="High Priority Tasks"
				tasks={appState.todos.filter((item) => item.priority === 'high')}
			/>
		</div>
		<div class="w-1/3">
			<TaskList
				title="Medium Priority Tasks"
				tasks={appState.todos.filter((item) => item.priority === 'medium')}
			/>
		</div>
		<div class="w-1/3">
			<TaskList
				title="Low Priority Tasks"
				tasks={appState.todos.filter((item) => item.priority === 'low')}
			/>
		</div>
	</div>
{:else}
	<TaskList title="My Tasks" tasks={appState.todos} />
{/if}
