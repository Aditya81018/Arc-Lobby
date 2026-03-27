<script lang="ts">
	import { Circle, X } from '@lucide/svelte';
	import type { TicTacToePlayer } from './types';

	const {
		token
	}: {
		token: TicTacToePlayer['token'];
	} = $props();
</script>

<div class="token-x flex h-full w-full flex-col items-center justify-center">
	{#if token === 'X'}
		<X size={80} />
	{:else if token === 'O'}
		<Circle size={64} />
	{/if}
</div>

<style scoped>
	@keyframes transition {
		from {
			transform: scale(1.25) translateY(-0.25rem);
		}
		to {
			transform: scale(1) translateY(0rem);
		}
	}

	.token-x {
		animation: transition 0.1s ease-in;
	}
</style>
