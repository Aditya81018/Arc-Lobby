<script lang="ts">
	import { currentGameSessionStore as session } from '../../game-sessions/store';
</script>

{#if $session !== null}
	<div>Simple Game</div>
	<div>{$session.id}</div>
	<div>{$session.state}</div>

	{#if $session.state === 'finished'}
		<div>Game has ended. Review screen must be displayed.</div>
	{/if}
{/if}
