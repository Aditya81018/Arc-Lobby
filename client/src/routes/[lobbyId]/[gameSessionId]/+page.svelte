<script lang="ts">
	import {
		currentGameSessionPlayersStore as players,
		currentGameSessionStore as session
	} from '../../../features/game-sessions/store';
	import SimpleGameUI from '../../../features/games/simple-game/SimpleGameUI.svelte';
	import { type SimpleGameSession } from '../../../features/games/simple-game/types';
	import { userData } from '../../../features/user/store';

	const isPlayer = $session?.players.includes($userData.id) || false;
</script>

<div class="flex h-svh w-screen flex-col">
	{#if $session?.gameId === 'simple-game'}
		<SimpleGameUI session={$session as SimpleGameSession} players={$players!} {isPlayer} />
	{/if}
</div>
