<script lang="ts">
	import { createLobby } from './controllers';

	let isLoading = $state(false);
	async function handleClick() {
		isLoading = true;

		const lobby = await createLobby();
		console.log('created lobby', lobby);

		isLoading = false;
	}
</script>

<button class="btn btn-primary" disabled={isLoading} onclick={handleClick}
	>{!isLoading ? 'Create Lobby' : 'Creating Lobby...'}</button
>
