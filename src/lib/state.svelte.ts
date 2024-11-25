import { writable } from 'svelte/store';

interface State {
	confirm: {
		before_delete: boolean;
		before_create: boolean;
	};
	description: {
		show: boolean;
	};
	priority: {
		show: boolean;
	};
	chat: {
		position: 'left' | 'right';
	};
}
export let state = $state<State>({
	confirm: {
		before_create: false,
		before_delete: false
	},
	description: {
		show: true
	},
	priority: {
		show: false
	},
	chat: {
		position: 'left'
	}
});

//$effect(() => {
//	window.localStorage.setItem('state', JSON.stringify(state));
//});
