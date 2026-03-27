<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { socket } from '$lib/socket';
	import { onMount } from 'svelte';
	import LoadingScreen from '../../components/LoadingScreen.svelte';
	import { joinGameSession, rematchGameSession } from './controller';
	import { gameSessionsStore, type GameSession } from './store';
	import { getMemberFromId } from '../lobby/controllers';
	import { userData } from '../user/store';
	import UserAvatar from '../../components/UserAvatar.svelte';

	const {
		session
	}: {
		session: GameSession;
	} = $props();

	interface IncomingRequest {
		newSessionId: string;
		fromPlayerId: string;
	}

	let isLoading = $state(false);
	let incomingRequest = $state<IncomingRequest | undefined>(undefined);
	let incomingSession = $derived(
		incomingRequest ? $gameSessionsStore[incomingRequest.newSessionId] : undefined
	);
	let fromPlayer = $derived(getMemberFromId(incomingRequest?.fromPlayerId ?? ''));

	async function handleRequestRematch() {
		isLoading = true;
		const gameSession = await rematchGameSession(session.id, $userData.id);
		const joinedSession = await joinGameSession(gameSession.id);
		if (joinedSession) {
			goto(
				resolve(
					`/${joinedSession.lobbyId}/redirect?to=${`/${joinedSession.lobbyId}/${joinedSession.id}`}`
				)
			);
			return;
		}

		if (!joinedSession) {
			isLoading = false;
		}
	}

	async function handleAcceptRematch() {
		if (!incomingRequest) return;

		try {
			isLoading = true;
			const joinedSession = await joinGameSession(incomingRequest.newSessionId);
			if (joinedSession) {
				goto(
					resolve(
						`/${joinedSession.lobbyId}/redirect?to=${`/${joinedSession.lobbyId}/${joinedSession.id}`}`
					)
				);
				return;
			}
			if (!joinedSession) {
				isLoading = false;
			}
		} catch {
			goto(resolve(`/${session.lobbyId}/${incomingRequest.newSessionId}`));
		}
	}

	async function handleSpectateRematch() {
		if (!incomingSession) return;
		goto(
			resolve(
				`/${incomingSession.lobbyId}/redirect?to=/${incomingSession.lobbyId}/${incomingSession.id}`
			)
		);
	}

	function goBackToLobby() {
		goto(resolve(`/${session.lobbyId}`));
	}

	onMount(() => {
		function handleRematchRequest(newSessionId: string, fromPlayerId: string) {
			incomingRequest = {
				newSessionId,
				fromPlayerId
			};
		}
		socket.on('rematch', handleRematchRequest);
		return () => {
			socket.off('rematch', handleRematchRequest);
		};
	});
</script>

{#if isLoading}
	<LoadingScreen />
{/if}

{#if incomingRequest !== undefined}
	<div
		class="fixed top-0 left-0 flex h-screen w-screen flex-col items-center justify-center backdrop-blur-sm"
	>
		<div class="flex flex-col items-center justify-center gap-4 rounded bg-base-300 p-8">
			<div class="text-2xl font-bold">Incoming Rematch Request</div>
			<div class="flex items-center gap-2">
				<UserAvatar user={fromPlayer!} />
				<span class="font-bold" style="color: {fromPlayer?.color.foreground ?? 'gray'}">
					{fromPlayer?.name ?? 'Unknown'}
				</span>
			</div>
			<div class="text-sm font-medium opacity-50">
				{#if incomingSession?.state === 'waiting'}
					Waiting for players...
				{:else if incomingSession?.state === 'ongoing'}
					Game started!
				{:else}
					Game ended!
				{/if}
			</div>
			<div class="flex gap-2">
				{#if incomingSession?.state === 'waiting'}
					<button class="btn btn-success" onclick={handleAcceptRematch}>Accept</button>
					<button class="btn btn-error" onclick={goBackToLobby}>Decline</button>
				{:else if incomingSession?.state === 'ongoing'}
					<button class="btn btn-warning" onclick={handleSpectateRematch}>Spectate</button>
					<button class="btn btn-error" onclick={goBackToLobby}>Decline</button>
				{:else if incomingSession?.state === 'finished'}
					<button class="btn btn-warning" onclick={goBackToLobby}>Back To Lobby</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<button class="btn btn-secondary" onclick={handleRequestRematch}>Rematch</button>
