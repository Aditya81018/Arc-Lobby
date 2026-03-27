<script lang="ts">
	const {
		combo
	}: {
		combo: number;
	} = $props();
</script>

{#if combo === 0}
	<div class="stroke horizontal top-1/6"></div>
{:else if combo === 1}
	<div class="stroke horizontal top-3/6"></div>
{:else if combo === 2}
	<div class="stroke horizontal top-5/6"></div>
{:else if combo === 3}
	<div class="stroke vertical left-1/6"></div>
{:else if combo === 4}
	<div class="stroke vertical left-3/6"></div>
{:else if combo === 5}
	<div class="stroke vertical left-5/6"></div>
{:else if combo === 6}
	<div class="stroke slant rotate-45"></div>
{:else if combo === 7}
	<div class="stroke slant -rotate-45"></div>
{/if}

<style scoped>
	@import 'tailwindcss';

	@plugin 'daisyui' {
		logs: false;
	}

	@keyframes stroke-in {
		from {
			width: 0px;
		}
	}

	.stroke {
		@apply absolute h-2 w-full bg-accent;
		animation: stroke-in 0.25s ease-in;

		&.horizontal {
			@apply left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-0;
		}

		&.vertical {
			@apply top-1/2 -translate-x-[calc(50%-1px)] -translate-y-1/2 rotate-90;
		}

		&.slant {
			@apply top-1/2 left-1/2 h-2 w-[140%] -translate-1/2;
		}
	}
</style>
