<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import LoadingScreen from '../../../components/LoadingScreen.svelte';

	const path = page.url.searchParams.get('to') ?? '';
	goto(resolve(`/${path}`));
</script>

<LoadingScreen />
