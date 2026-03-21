<script lang="ts">
	import type { Snippet } from 'svelte';
	import { userData, type UserData } from '../../user/store';
	import PlayerCard from './PlayerCard.svelte';
	import type { SimpleGamePlayer, SimpleGameSession } from './types';

	const {
		players,
		playersData,
		session,
		children
	}: {
		players: (UserData | undefined)[];
		playersData: SimpleGamePlayer[];
		session: SimpleGameSession;
		children: Snippet<[]>;
	} = $props();

	// svelte-ignore state_referenced_locally
	const playersCount = session.settings['players-count'] as number;

	function getPlayerCardPropsFor(index: number) {
		let selfIndex = players?.findIndex((player) => player?.id === $userData.id);
		selfIndex = (selfIndex === -1 ? 0 : selfIndex) ?? 0;
		const newIndex = (selfIndex + index) % playersCount;
		return {
			player: players ? players[newIndex] : undefined,
			playerData: playersData[newIndex],
			session
		};
	}
</script>

<div class="relative flex h-full w-full items-center justify-center">
	{#if playersCount === 2}
		<div class="absolute bottom-2"><PlayerCard {...getPlayerCardPropsFor(0)} /></div>
		<div class="absolute top-2"><PlayerCard {...getPlayerCardPropsFor(1)} /></div>
	{:else if playersCount === 3}
		<div class="absolute bottom-2"><PlayerCard {...getPlayerCardPropsFor(0)} /></div>
		<div class="absolute left-2"><PlayerCard {...getPlayerCardPropsFor(1)} /></div>
		<div class="absolute right-2"><PlayerCard {...getPlayerCardPropsFor(2)} /></div>
	{:else if playersCount === 4}
		<div class="absolute bottom-2"><PlayerCard {...getPlayerCardPropsFor(0)} /></div>
		<div class="absolute left-2"><PlayerCard {...getPlayerCardPropsFor(1)} /></div>
		<div class="absolute top-2"><PlayerCard {...getPlayerCardPropsFor(2)} /></div>
		<div class="absolute right-2"><PlayerCard {...getPlayerCardPropsFor(3)} /></div>
	{/if}

	{@render children()}
</div>
