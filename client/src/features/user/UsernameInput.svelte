<script lang="ts">
	import UserAvatar from '../../components/UserAvatar.svelte';
	import { getRandomColor, getRandomEmoji } from './controllers';
	import { userData } from './store';

	let draft = $userData.name;

	function commit() {
		if (draft.length < 3 || draft.length > 18) {
			draft = $userData.name;
		} else {
			$userData.name = draft;
		}
	}
	function randomizeAvatar() {
		$userData = {
			...$userData,
			emoji: getRandomEmoji(),
			color: getRandomColor()
		};
	}
</script>

<button onclick={randomizeAvatar}>
	<UserAvatar user={$userData} />
</button>

<input
	type="text"
	bind:value={draft}
	onchange={commit}
	class="input text-center font-mono"
	style="color: {$userData.color.foreground}"
	placeholder="Username"
/>
