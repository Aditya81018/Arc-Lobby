<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getMembersData, joinLobby, leaveLobby } from '../../features/lobby/controllers';
	import { socket } from '$lib/socket';
	import { lobbyStore, membersStore } from '../../features/lobby/store';
	import {
		currentGameSessionStore as session,
		gameSessionsStore,
		type GameSession
	} from '../../features/game-sessions/store';
	import LoadingScreen from '../../components/LoadingScreen.svelte';

	const { children } = $props();
	const lobbyId = page.params.lobbyId!;
	let isLoading = $state(true);

	onMount(() => {
		async function handleMemberUpdate(members: string[]) {
			if (!$lobbyStore) {
				$membersStore = null;
				return;
			}
			$lobbyStore.members = members;
			$membersStore = await getMembersData($lobbyStore.id);
		}

		function handleGameSessionUpdate(gameSession: GameSession) {
			const existingSession = $gameSessionsStore[gameSession.id];
			if (existingSession) {
				$gameSessionsStore[gameSession.id] = gameSession;
				if ($session && $session.id === existingSession.id) {
					$session = gameSession;
				}
			}
		}

		handle();
		async function handle() {
			const success = await joinLobby(lobbyId);
			if (!success) {
				return goto(resolve('/'));
			}

			isLoading = false;
			$membersStore = await getMembersData(lobbyId);
			socket.on('member-update', handleMemberUpdate);
			socket.on('game-session-update', handleGameSessionUpdate);
		}

		return () => {
			leaveLobby(lobbyId);
			socket.off('member-update', handleMemberUpdate);
			socket.off('game-session-update', handleGameSessionUpdate);
		};
	});
</script>

{#if isLoading}
	<LoadingScreen />
{:else}
	{@render children()}
{/if}
