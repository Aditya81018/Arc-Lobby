<script lang="ts">
	let modal: HTMLDialogElement;
	let lobbyID = '';

	function handleInput() {
		lobbyID = lobbyID
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '')
			.slice(0, 6);
	}
</script>

<button class="btn btn-secondary" onclick={() => modal.showModal()}>Join Lobby</button>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<div class="flex flex-col items-center justify-center gap-4">
			<h3 class="text-lg font-medium">Enter Lobby ID</h3>
			<input
				class="input text-center font-mono"
				placeholder="A1B2C3"
				bind:value={lobbyID}
				oninput={handleInput}
			/>
			<button class="btn btn-wide btn-secondary">Join</button>
		</div>
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
