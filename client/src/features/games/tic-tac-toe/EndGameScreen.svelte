<script lang="ts">
	import UserAvatar from '../../../components/UserAvatar.svelte';
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

	let isHidden = $state(true);

	setTimeout(() => {
		isHidden = false;
	}, 750);

	const winner = $derived(
		session.winner
			? session.winner === 'draw'
				? 'draw'
				: players[session.players.indexOf(session.winner)]
			: undefined
	);
</script>

<div
	class="absolute top-0 left-0 z-50 h-svh w-screen flex-col items-center justify-center backdrop-blur-sm {isHidden
		? 'hidden'
		: 'flex'}"
>
	<div class="screen flex flex-col gap-6 rounded bg-base-200 p-8 text-center text-lg">
		<div class="flex items-center justify-center gap-2 font-bold">
			{#if winner === 'draw'}
				<span class="opacity-50">Match Draw!</span>
			{:else if winner !== undefined}
				<UserAvatar user={winner} />
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

<style scoped>
	@keyframes transition {
		from {
			transform: scale(1.25) translateY(-0.25rem);
		}
		to {
			transform: scale(1) translateY(0rem);
		}
	}

	.screen {
		animation: transition 0.1s ease-in;
	}
</style>
