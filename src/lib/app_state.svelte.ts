export interface Todo {
	title: string;
	priority: "high" | "medium" | "low";
	description?: string;
}

interface State {
	chat: {
		position: 'left' | 'right';
	};
	groupBy: "none" | "priority";
	todos: Todo[];
}

export const appState = $state<State>({
	chat: {
		position: 'left'
	},
	groupBy: "none",
	todos: [
	],
});
