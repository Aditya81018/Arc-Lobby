<script lang="ts">
	import {
		currentGameSessionPlayersStore as players,
		currentGameSessionStore as session
	} from '../../../features/game-sessions/store';
	import SimpleGameUI from '../../../features/games/simple-game/SimpleGameUI.svelte';
	import TicTacToeUI from '../../../features/games/tic-tac-toe/TicTacToeUI.svelte';
	import { userData } from '../../../features/user/store';

	const isPlayer = $derived($session?.players.includes($userData.id) || false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = $derived({ session: $session as any, players: $players!, isPlayer });
</script>

<div class="flex h-svh w-screen flex-col">
	{#if $session?.gameId === 'simple-game'}
		<SimpleGameUI {...data} />
	{:else if $session?.gameId === 'tic-tac-toe'}
		<TicTacToeUI {...data} />
	{:else}
		No session
	{/if}
</div>
