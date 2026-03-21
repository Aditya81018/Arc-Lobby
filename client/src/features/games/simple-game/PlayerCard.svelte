<script lang="ts">
	import { userData, type UserData } from '../../user/store';
	import type { SimpleGamePlayer, SimpleGameSession } from './types';
	import UserAvatar from '../../../components/UserAvatar.svelte';
	import { Heart, X } from '@lucide/svelte';

	const {
		player,
		playerData,
		session
	}: {
		player: UserData;
		playerData: SimpleGamePlayer;
		session: SimpleGameSession;
	} = $props();
</script>

<div class="flex w-fit flex-col items-center justify-center gap-0.5 p-2">
	<UserAvatar user={player} />
	<div class="text-sm" style="color: {player.color.foreground};">
		{player.name}
		{#if $userData.id === player.id}
			<span class="text-xs font-bold">(You)</span>
		{/if}
	</div>
	<div class="flex items-center justify-center gap-1">
		{#each Array(playerData.lives) as id, i (i)}
			<Heart color="red" size={12} {id} />
		{:else}
			<X color="red" />
		{/each}
	</div>
	<span class="text-sm text-success">
		{playerData.points}/{session.settings['target']}
	</span>
</div>
