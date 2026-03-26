<script lang="ts">
	import LeaveGameSessionButton from '../../game-sessions/LeaveGameSessionButton.svelte';
	import type { UserData } from '../../user/store';
	import Board from './Board.svelte';
	import EndGameScreen from './EndGameScreen.svelte';
	import PlayersLayout from './PlayersLayout.svelte';
	import type { TicTacToeSession } from './types';

	const {
		session,
		players,
		isPlayer
	}: {
		session: TicTacToeSession;
		players: (UserData | undefined)[];
		isPlayer: boolean;
	} = $props();

	const data = $derived({ session, players, playersData: session.data.playersData, isPlayer });
</script>

<LeaveGameSessionButton />

<PlayersLayout {...data}>
	<Board {...data} />
	{#if session.state === 'finished'}
		<EndGameScreen {...data} />
	{/if}
</PlayersLayout>
