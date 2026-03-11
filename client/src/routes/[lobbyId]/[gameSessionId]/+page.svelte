<script lang="ts">
	import LeaveGameSessionButton from '../../../features/game-sessions/LeaveGameSessionButton.svelte';
	import {
		currentGameSessionPlayersStore,
		currentGameSessionStore
	} from '../../../features/game-sessions/store';
	import SimpleGameUI from '../../../features/games/user-interface/SimpleGameUI.svelte';
	import { userData } from '../../../features/user/store';

	const isPlayer = $currentGameSessionStore?.players.includes($userData.id);
</script>

<h1>Game Session {isPlayer ? 'Player' : 'Spectator'}</h1>
<LeaveGameSessionButton />
{#each $currentGameSessionPlayersStore as player, i (i)}
	<div>
		{player.name}
	</div>
{/each}

{#if $currentGameSessionStore?.gameId === 'simple-game'}
	<SimpleGameUI />
{/if}
