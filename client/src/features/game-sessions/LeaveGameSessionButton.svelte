<script>
	import { resolve } from '$app/paths';
	import { SquareArrowRightExit } from '@lucide/svelte';
	import { currentGameSessionStore as session } from './store';
</script>

<a
	href={resolve(`/${$session?.lobbyId}`)}
	class="btn absolute top-4 right-4 z-50 btn-square btn-soft btn-error"
	><SquareArrowRightExit />
</a>
