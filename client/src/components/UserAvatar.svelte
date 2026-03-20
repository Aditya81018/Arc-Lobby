<script lang="ts">
	import { User } from '@lucide/svelte';
	import type { UserData } from '../features/user/store';

	const {
		user
	}: {
		user: UserData | undefined;
	} = $props();
</script>

<div
	class="flex h-8 w-8 items-center justify-center rounded-full"
	style="background-color: {user?.color.background || 'gray'};"
>
	{#if user}
		{user.emoji}
	{:else}
		<User />
	{/if}
</div>
