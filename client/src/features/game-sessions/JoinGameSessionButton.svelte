<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { joinGameSession } from './controller';

	let { lobbyId } = page.params;
	let { gameSessionId } = $props();

	async function handleJoinGameSession() {
		const session = await joinGameSession(gameSessionId);
		if (session) {
			goto(resolve(`/${lobbyId}/${session.id}`));
			return;
		}
	}
</script>

<button onclick={handleJoinGameSession} class="btn h-8 btn-xs btn-primary"> Join </button>
