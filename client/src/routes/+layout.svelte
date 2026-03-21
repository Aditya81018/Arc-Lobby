<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { socket } from '$lib/socket';
	import { loadInitialDataFromServer } from '$lib/load-data';
	import LoadingScreen from '../components/LoadingScreen.svelte';
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
	<LoadingScreen />
{:else}
	{@render children()}
{/if}
