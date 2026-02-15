<script lang="ts">
	import CreateLobbyButton from '../features/lobby/CreateLobbyButton.svelte';
	import JoinLobbyButton from '../features/lobby/JoinLobbyButton.svelte';
	import UsernameInput from '../features/user/UsernameInput.svelte';
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-4">
	<h1 class="text-4xl font-medium">Arc Lobby</h1>
	<UsernameInput />
	<div class="flex gap-2">
		<CreateLobbyButton />
		<JoinLobbyButton />
	</div>
</div>
