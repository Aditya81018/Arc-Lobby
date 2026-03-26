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
		session.winner ? players[session.players.indexOf(session.winner)] : undefined
	);
</script>

<div
	class="absolute top-0 left-0 flex h-svh w-screen flex-col items-center justify-center backdrop-blur-sm"
>
	<div class="z-50 flex flex-col gap-4 rounded bg-base-200 p-8 text-center text-lg">
		<div class="font-bold">
			<span style="color: {winner?.color.foreground ?? 'gray'};">{winner?.name ?? 'Unknown'}</span> Won!
		</div>
		<div class="flex gap-4">
			<RematchButton {session} />
			<BackToLobbyButton {session} />
		</div>
	</div>
</div>
