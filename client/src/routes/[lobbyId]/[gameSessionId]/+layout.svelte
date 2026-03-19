<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket';
	import {
		currentGameSessionPlayersStore,
		currentGameSessionStore,
		type GameSession
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

		async function handleSessionDataUpdate(newData: GameSession['data']) {
			if (!$currentGameSessionStore) return;
			$currentGameSessionStore.data = newData;
		}

		handle();
		async function handle() {
			try {
				const gameSession = await getGameSessionById(gameSessionId);
				if (!gameSession || gameSession.lobbyId !== lobbyId) {
					return goto(resolve(`/${lobbyId}`));
				}

				$currentGameSessionStore = gameSession;
				$currentGameSessionPlayersStore = await getCurrentGameSessionPlayersData(gameSessionId);

				socket.emit('join-game-session', gameSessionId);
				socket.on('players-update', handlePlayersUpdate);
				socket.on('session-data-update', handleSessionDataUpdate);

				isLoading = false;
			} catch {
				goto(resolve(`/${lobbyId}`));
			}
		}

		return () => {
			leaveGameSession(gameSessionId);
			$currentGameSessionStore = null;
			$currentGameSessionPlayersStore = null;

			socket.emit('leave-game-session', gameSessionId);
			socket.off('players-update', handlePlayersUpdate);
			socket.off('session-data-update', handleSessionDataUpdate);
		};
	});
</script>

{#if isLoading}
	<div>Joining Game...</div>
{:else}
	{@render children()}
{/if}
