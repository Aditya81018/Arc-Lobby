<script lang="ts">
	import { resolve } from '$app/paths';
	import type { GameSession } from './store';

	const {
		session
	}: {
		session: GameSession;
	} = $props();
</script>

<a href={resolve(`/${session.lobbyId}`)} class="btn w-fit btn-primary">Back to Lobby</a>
