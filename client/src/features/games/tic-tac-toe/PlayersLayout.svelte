<script lang="ts">
	import type { Snippet } from 'svelte';
	import { userData, type UserData } from '../../user/store';
	import PlayerCard from './PlayerCard.svelte';
	import type { TicTacToePlayer, TicTacToeSession } from './types';

	const {
		players,
		playersData,
		session,
		children
	}: {
		players: (UserData | undefined)[];
		playersData: TicTacToePlayer[];
		session: TicTacToeSession;
		children: Snippet<[]>;
	} = $props();

	function getPlayerCardPropsFor(index: number) {
		let selfIndex = players?.findIndex((player) => player?.id === $userData.id);
		selfIndex = (selfIndex === -1 ? 0 : selfIndex) ?? 0;
		const newIndex = (selfIndex + index) % 2;
		return {
			player: players ? players[newIndex] : undefined,
			playerData: playersData[newIndex],
			session
		};
	}
</script>

<div class="relative flex h-full w-full flex-col items-center justify-around gap-8 py-8">
	<div class=""><PlayerCard {...getPlayerCardPropsFor(1)} /></div>

	{@render children()}

	<div class="relative z-0"><PlayerCard {...getPlayerCardPropsFor(0)} /></div>
</div>
