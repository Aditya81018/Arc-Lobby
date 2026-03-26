<script lang="ts">
	import { socket } from '$lib/socket';
	import { userData, type UserData } from '../../user/store';
	import type { TicTacToePlayer, TicTacToeSession } from './types';

	const {
		session,
		players,
		playersData
	}: {
		session: TicTacToeSession;
		players: (UserData | undefined)[];
		playersData: TicTacToePlayer[];
	} = $props();

	function occupiedBy(position: number) {
		return playersData.find((player) => player.moves.includes(position));
	}

	function onClick(position: number) {
		return () => {
			if (
				session.state === 'ongoing' &&
				session.data.turnOf === session.players.indexOf($userData.id)
			)
				socket.emit('place-token', position);
		};
	}
</script>

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<div class="flex flex-col">
	{#each new Array(3) as row, i (i)}
		<div class="flex">
			{#each new Array(3) as box, j (j)}
				{@const playerData = occupiedBy(i * 3 + j)}
				{@const player = playerData ? players[playerData.id] : undefined}
				<button
					onclick={onClick(i * 3 + j)}
					class="h-28 w-28 border-base-300 font-mono text-6xl {i !== 0 ? 'border-t-4' : ''} {j !== 0
						? 'border-l-4'
						: ''}"
					style="color: {player?.color.foreground};">{playerData?.token}</button
				>
			{/each}
		</div>
	{/each}
</div>
