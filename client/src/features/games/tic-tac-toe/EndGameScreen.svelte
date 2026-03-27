<script lang="ts">
	import BackToLobbyButton from '../../game-sessions/BackToLobbyButton.svelte';
	import RematchButton from '../../game-sessions/RematchButton.svelte';
	import type { UserData } from '../../user/store';
	import type { TicTacToeSession } from './types';

	const {
		session,
		players
	}: {
		session: TicTacToeSession;
		players: (UserData | undefined)[];
	} = $props();

	const winner = $derived(
		session.winner
			? session.winner === 'draw'
				? 'draw'
				: players[session.players.indexOf(session.winner)]
			: undefined
	);
</script>

<div
	class="absolute top-0 left-0 z-50 flex h-svh w-screen flex-col items-center justify-center backdrop-blur-sm"
>
	<div class="flex flex-col gap-4 rounded bg-base-200 p-8 text-center text-lg">
		<div class="font-bold">
			{#if winner === 'draw'}
				<span class="opacity-50">Match Draw!</span>
			{:else if winner !== undefined}
				<span style="color: {winner.color.foreground ?? 'gray'};">{winner.name ?? 'Unknown'}</span> Won!
			{:else}
				<span class="opacity-50">Game Ended...</span>
			{/if}
		</div>
		<div class="flex gap-4">
			<RematchButton {session} />
			<BackToLobbyButton {session} />
		</div>
	</div>
</div>
