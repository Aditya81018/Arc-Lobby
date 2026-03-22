<script lang="ts">
	import { userData, type UserData } from '../../user/store';
	import type { SimpleGamePlayer, SimpleGameSession } from './types';
	import UserAvatar from '../../../components/UserAvatar.svelte';
	import { Heart, X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const {
		player,
		playerData,
		session
	}: {
		player: UserData | undefined;
		playerData: SimpleGamePlayer;
		session: SimpleGameSession;
	} = $props();

	let isPlayerTurn = $derived(session.data.turnOf === playerData.id);
	let timeLeft = $state(0);
	let isVisible = $state(true);

	$effect(() => {
		let isLoopNeeded = () => isPlayerTurn && session.state === 'ongoing' && isVisible;

		if (!isLoopNeeded()) return;

		function animate() {
			timeLeft = Math.max(Math.fround((session.data.nextTimestamp! - Date.now()) / 1000), 0);
			if (isLoopNeeded()) requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);
	});

	onMount(() => {
		isVisible = true;
		return () => {
			isVisible = false;
		};
	});
</script>

<div
	class="flex w-fit flex-col items-center justify-center gap-0.5 p-2 {playerData.lives === 0 ||
	player === undefined
		? 'saturate-0'
		: 'saturate-100'}"
>
	{#if isPlayerTurn && timeLeft !== 0}
		<div
			class="radial-progress"
			style="--value:{timeLeft * 10}; color: {player?.color
				.foreground}; --size: 48px; --thickness: 4px"
		>
			<UserAvatar user={player} />
		</div>
	{:else}
		<div class="my-2">
			<UserAvatar user={player} />
		</div>
	{/if}
	<div class="text-sm" style="color: {player?.color.foreground || 'gray'};">
		{player?.name ?? (session.state === 'waiting' ? 'Waiting...' : 'Unknown')}
		{#if $userData.id === player?.id}
			<span class="text-xs font-bold">(You)</span>
		{/if}
	</div>
	<div class="flex items-center justify-center gap-1">
		{#each Array(playerData?.lives) as id, i (i)}
			<Heart color="red" size={12} {id} />
		{:else}
			<X color="red" />
		{/each}
	</div>
	<span class="text-sm text-success">
		{playerData?.points}/{session?.settings['target']}
	</span>
</div>
