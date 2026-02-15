<script lang="ts">
	import { userData } from './store';

	let draft = $userData.name;

	function commit() {
		if (draft.length < 3 || draft.length > 18) {
			draft = $userData.name;
		} else {
			$userData.name = draft;
		}
	}
</script>

<input
	type="text"
	bind:value={draft}
	onchange={commit}
	class="input text-center font-mono"
	placeholder="Username"
/>
