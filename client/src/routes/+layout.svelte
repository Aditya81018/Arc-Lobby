<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { socket } from '$lib/socket';
	import { loadInitialDataFromServer } from '$lib/load-data';
	let isLoading = $state(true);

	let { children } = $props();
	socket.connect();
	socket.on('connect', async () => {
		await loadInitialDataFromServer();
		isLoading = false;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isLoading}
	<div>Connecting to server...</div>
{:else}
	{@render children()}
{/if}
