<script lang="ts">
	import { Heart, SquareArrowRightExit } from '@lucide/svelte';
	import UserAvatar from '../../../components/UserAvatar.svelte';
	import { type UserData, userData as user } from '../../user/store';
	import { resolve } from '$app/paths';
	import { socket } from '$lib/socket';
	import type { SimpleGameSession } from './types';

	const {
		session,
		players,
		isPlayer
	}: {
		session: SimpleGameSession;
		players: (UserData | undefined)[];
		isPlayer: boolean;
	} = $props();

	console.log(session);

	let isUserTurn = $derived(session.players[session.data.turnOf] === $user.id);
	let isOptionsEnabled = $derived(isUserTurn && session.state === 'ongoing');
	let playerData = $derived(session.data.playersData[session.players.indexOf($user.id)]);
	let hasPlayerLost = $derived(playerData.lives === 0);

	function handleOptionSelect(number: number) {
		if (!isPlayer || session.state !== 'ongoing') return;
		return () => {
			socket.emit('option-select', number);
		};
	}
</script>

<div class="flex h-full flex-col p-4">
	<div class="text-4xl font-medium">Simple Game</div>
	<div class="text-sm text-gray-400">
		{session.state === 'waiting' ? 'Waiting for more players' : 'Game Started'}
	</div>
	<div class="text-sm text-gray-400">
		You are a {isPlayer ? `Player - ${hasPlayerLost ? 'Lost' : 'Playing'}` : 'Spectator'}
	</div>

	{#each players as player, i (i)}
		{@const playerData = session.data.playersData[i]}
		<div class="mt-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<UserAvatar user={player} />
				<div style="color: {player?.color.foreground || 'gray'}">
					{player?.name || 'Unknown'}
					<span class="text-sm font-bold opacity-50">
						{player?.id === $user.id ? '(You)' : ''}
					</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#each Array(playerData.lives) as id, i (i)}
					<Heart color="red" size={16} {id} />
				{:else}
					<div class="text-error font-medium text-sm">LOST</div>
				{/each}
				<span class="text-success">
					{playerData.points}
				</span>
			</div>
		</div>
	{/each}

	<a
		href={resolve(`/${session.lobbyId}`)}
		class="btn absolute top-4 right-4 btn-square btn-soft btn-error"
		><SquareArrowRightExit />
	</a>

	<div class="flex h-full w-full flex-col items-center justify-center gap-4">
		<div id="index-number" class="text-9xl font-bold">{session.data.target}</div>
		<div class="h-8 opacity-50">{session.data.message}</div>
		<div class="flex w-full items-center justify-center gap-8">
			{#each session.data.options as option, i (i)}
				<button
					class="btn btn-square btn-xl btn-primary"
					disabled={!isOptionsEnabled}
					onclick={handleOptionSelect(option)}>{option}</button
				>
			{/each}
		</div>
	</div>

	{#if session.state === 'finished'}
		<div>Game has ended. Review screen must be displayed.</div>
	{/if}
</div>
