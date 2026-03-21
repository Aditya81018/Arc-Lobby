<script lang="ts">
	import { SquareArrowRightExit } from '@lucide/svelte';
	import { resolve } from '$app/paths';
</script>

<a class="btn btn-wide btn-soft btn-error" href={resolve(`/`)}>
	<SquareArrowRightExit />
	<span>Leave Button</span>
</a>
