<script lang="ts">
	import type { UserData } from '../features/user/store';

	const {
		user
	}: {
		user: UserData;
	} = $props();
</script>

<div
	class="flex h-8 w-8 items-center justify-center rounded-full"
	style="background-color: {user.color.background};"
>
	{user.emoji}
</div>
