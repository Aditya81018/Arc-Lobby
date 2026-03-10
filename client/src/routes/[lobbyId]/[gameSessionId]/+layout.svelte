<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket';
	import {
		currentGameSessionPlayersStore,
		currentGameSessionStore
	} from '../../../features/game-sessions/store';
	import {
		getCurrentGameSessionPlayersData,
		getGameSessionById,
		leaveGameSession
	} from '../../../features/game-sessions/controller';

	const { children } = $props();
	const lobbyId = page.params.lobbyId!;
	const gameSessionId = page.params.gameSessionId!;
	let isLoading = $state(true);

	onMount(() => {
		async function handlePlayersUpdate(players: string[]) {
			if (!$currentGameSessionStore) {
				$currentGameSessionPlayersStore = null;
				return;
			}
			$currentGameSessionStore.players = players;
			$currentGameSessionPlayersStore = await getCurrentGameSessionPlayersData(gameSessionId);
		}

		handle();
		async function handle() {
			const gameSession = await getGameSessionById(gameSessionId);
			if (!gameSession || gameSession.lobbyId !== lobbyId) {
				return goto(resolve('/'));
			}

			$currentGameSessionStore = gameSession;
			$currentGameSessionPlayersStore = await getCurrentGameSessionPlayersData(gameSessionId);

			socket.emit('join-game-session', gameSessionId);
			socket.on('players-update', handlePlayersUpdate);

			isLoading = false;
		}

		return () => {
			leaveGameSession(gameSessionId);
			$currentGameSessionStore = null;
			$currentGameSessionPlayersStore = null;

			socket.emit('leave-game-session', gameSessionId);
			socket.off('players-update', handlePlayersUpdate);
		};
	});
</script>

{#if isLoading}
	<div>Joining Game...</div>
{:else}
	{@render children()}
{/if}
