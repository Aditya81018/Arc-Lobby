<script lang="ts">
	import { Gamepad, X, ChevronLeft, Send } from '@lucide/svelte';
	import type { Game } from './types';
	import { sendGameSessionInvite } from '../messages/controller';
	import { createGameSession, joinGameSession } from '../game-sessions/controller';
	import { page } from '$app/state';
	import { userData } from '../user/store';
	import { gamesStore } from './store';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const lobbyId = page.params.lobbyId!;

	let modalRef: HTMLDialogElement;

	let selectedGame = $state<Game | null>(null);
	let settingsValues = $state<Record<string, any>>({});

	const openModal = () => {
		selectedGame = null;
		settingsValues = {};
		modalRef.showModal();
	};

	const closeModal = () => modalRef.close();

	const handleGameSelect = (game: Game) => {
		selectedGame = game;
		const defaults: Record<string, any> = {};
		game.settings?.forEach((s) => {
			defaults[s.id] = s.defaultValue;
		});
		settingsValues = defaults;
	};

	const toggleMultiSelect = (settingId: string, value: any) => {
		const current = settingsValues[settingId] as any[];
		if (current.includes(value)) {
			settingsValues[settingId] = current.filter((v) => v !== value);
		} else {
			settingsValues[settingId] = [...current, value];
		}
	};

	const handleSendGameInvite = async () => {
		const gameSession = await createGameSession(selectedGame!.id, lobbyId, settingsValues);
		sendGameSessionInvite(lobbyId, $userData.id, gameSession.id);

		const session = await joinGameSession(gameSession.id);
		if (session) {
			goto(resolve(`/${lobbyId}/${session.id}`));
			return;
		}

		closeModal();
	};
</script>

<button class="btn btn-square shadow-lg btn-primary" type="button" onclick={openModal}>
	<Gamepad size={24} />
</button>

<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box flex max-h-[85vh] max-w-xl flex-col overflow-hidden p-0">
		<div class="flex items-center justify-between bg-base-100 px-6 py-4">
			<div class="flex items-center gap-3">
				{#if selectedGame}
					<button class="btn btn-circle btn-ghost btn-xs" onclick={() => (selectedGame = null)}>
						<ChevronLeft size={20} />
					</button>
				{/if}
				<h3 class="text-xl font-bold">{selectedGame ? selectedGame.name : 'Select Game'}</h3>
			</div>
			<button class="btn btn-circle btn-ghost btn-sm" onclick={closeModal}>
				<X size={20} />
			</button>
		</div>

		<div class="custom-scrollbar overflow-y-auto px-6 pb-6">
			{#if !selectedGame}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each Object.values($gamesStore) as game, i (i)}
						<button
							onclick={() => handleGameSelect(game)}
							class="group relative aspect-4/3 overflow-hidden rounded-2xl bg-base-300 transition-transform active:scale-95"
						>
							<img
								src={game.image}
								alt={game.name}
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<div class="absolute inset-0 flex items-end bg-black/50 p-3">
								<span class="text-xs font-bold text-white sm:text-sm">{game.name}</span>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="divide-y divide-base-200">
					{#each selectedGame.settings || [] as setting, i (i)}
						<div class="py-5 first:pt-0">
							<label class="mb-3 block text-sm font-bold tracking-wider uppercase opacity-60">
								{setting.name}
							</label>

							{#if setting.type === 'boolean'}
								<input
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={settingsValues[setting.id]}
								/>
							{:else if setting.type === 'pick-one'}
								<div class="flex flex-wrap gap-2">
									{#each setting.options as option, i (i)}
										<button
											class="no-animation btn rounded-lg font-medium btn-sm {settingsValues[
												setting.id
											] === option.value
												? 'btn-primary'
												: 'border-none bg-base-200 btn-ghost hover:bg-base-300'}"
											onclick={() => (settingsValues[setting.id] = option.value)}
										>
											{option.name}
										</button>
									{/each}
								</div>
							{:else if setting.type === 'pick-many'}
								<div class="flex flex-wrap gap-2">
									{#each setting.options as option, i (i)}
										<button
											class="no-animation btn rounded-lg font-medium btn-sm {settingsValues[
												setting.id
											].includes(option.value)
												? 'btn-primary'
												: 'border-none bg-base-200 btn-ghost hover:bg-base-300'}"
											onclick={() => toggleMultiSelect(setting.id, option.value)}
										>
											{option.name}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if selectedGame}
			<div class="bg-base-100 p-6 pt-2">
				<button class="btn h-12 btn-block shadow-md btn-primary" onclick={handleSendGameInvite}>
					<Send size={18} class="mr-2" />
					Send Game Invite
				</button>
			</div>
		{/if}
	</div>

	<form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-[2px]">
		<button>close</button>
	</form>
</dialog>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
</style>
