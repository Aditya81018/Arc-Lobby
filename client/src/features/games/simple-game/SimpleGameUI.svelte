<script lang="ts">
	import { type UserData, userData as user } from '../../user/store';
	import { resolve } from '$app/paths';
	import { socket } from '$lib/socket';
	import type { SimpleGameSession } from './types';
	import { SquareArrowRightExit } from '@lucide/svelte';
	import PlayersLayout from './PlayersLayout.svelte';

	const {
		session,
		players,
		isPlayer
	}: {
		session: SimpleGameSession;
		players: (UserData | undefined)[];
		isPlayer: boolean;
	} = $props();

	let isPlayerTurn = $derived(session.players[session.data.turnOf] === $user.id);
	let isOptionsEnabled = $derived(isPlayerTurn && session.state === 'ongoing');

	function handleOptionSelect(number: number) {
		if (!isPlayer || session.state !== 'ongoing') return;
		return () => {
			isPlayerTurn = false;
			socket.emit('option-select', number);
		};
	}
</script>

<div class="flex h-full flex-col p-4">
	<a
		href={resolve(`/${session.lobbyId}`)}
		class="btn absolute top-4 right-4 z-50 btn-square btn-soft btn-error"
		><SquareArrowRightExit />
	</a>

	<PlayersLayout {players} playersData={session.data.playersData} {session}>
		{#if session.state === 'finished'}
			{@const winner = players.find((player) => player?.id === session.winner)}
			<div class="flex flex-col items-center gap-4">
				<div class="text-4xl font-black">{winner?.name ?? 'Unknown'} Won!</div>
				<a href={resolve(`/${session.lobbyId}`)} class="btn w-fit btn-sm btn-primary"
					>Back to Lobby</a
				>
			</div>
		{:else}
			<!-- else content here -->
			<div
				class="flex h-full w-full flex-col items-center justify-center gap-4 {session.state ===
				'waiting'
					? 'opacity-25'
					: 'opacity-100'}"
			>
				<div id="index-number" class="text-9xl font-bold">{session.data.target}</div>
				<div class="h-8 opacity-50">
					{session.data.message}
				</div>
				<div class="flex w-full items-center justify-center gap-4">
					{#each session.data.options as option, i (i)}
						<button
							class="btn btn-square btn-xl btn-primary"
							disabled={!isOptionsEnabled}
							onclick={handleOptionSelect(option)}>{option}</button
						>
					{/each}
				</div>
			</div>
		{/if}
	</PlayersLayout>
</div>
