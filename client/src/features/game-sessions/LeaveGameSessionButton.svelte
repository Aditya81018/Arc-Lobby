<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const lobbyId = page.params.lobbyId!;

	async function handleLeaveGameSession() {
		goto(resolve(`/${lobbyId}`));
	}
</script>

<button class="btn btn-primary" onclick={handleLeaveGameSession}>Leave Game</button>
