export interface Todo {
	title: string;
	priority: "high" | "medium" | "low";
	description?: string;
}

interface State {
	chat: {
		position: 'left' | 'right';
	};
	groupBy: null | "priority";
	todos: Todo[];
}

export let appState = $state<State>({
	chat: {
		position: 'left'
	},
	groupBy: null,
	todos: [
		{title: "Eat", description: "healfy breakfast", priority: "low"}
	],
});
