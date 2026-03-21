<script lang="ts">
	import { User } from '@lucide/svelte';
	import type { UserData } from '../features/user/store';

	const {
		user,
		outline = false
	}: {
		user: UserData | undefined;
		outline?: boolean;
	} = $props();
</script>

<div
	class="flex h-8 w-8 items-center justify-center rounded-full {outline
		? 'outline-2 outline-offset-2 outline-success'
		: ''}"
	style="background-color: {user?.color.background || 'gray'};"
>
	{#if user}
		{user.emoji}
	{:else}
		<User />
	{/if}
</div>
