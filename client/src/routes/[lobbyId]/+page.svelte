<script lang="ts">
	import { page } from '$app/state';
	import { socket } from '$lib/socket';
	import { ArrowDown, Menu, MessageSquareDashed, Send } from '@lucide/svelte';
	import { getMemberFromId } from '../../features/lobby/controllers';
	import LeaveLobbyButton from '../../features/lobby/LeaveLobbyButton.svelte';
	import { membersStore } from '../../features/lobby/store';
	import { sendTextMessage } from '../../features/messages/controller';
	import { lobbyMessagesStore } from '../../features/messages/store';
	import SendGameInviteButton from '../../features/games/SendGameInviteButton.svelte';
	import { getLocalGameById } from '../../features/games/controller';
	import JoinGameSessionButton from '../../features/game-sessions/JoinGameSessionButton.svelte';
	import SpectateGameSessionButton from '../../features/game-sessions/SpectateGameSessionButton.svelte';
	import { gameSessionsStore } from '../../features/game-sessions/store';
	import { userData } from '../../features/user/store';
	import UserAvatar from '../../components/UserAvatar.svelte';

	const lobbyId = page.params.lobbyId!;
	let message = $state('');

	let messagesContainer: HTMLElement;
	let showScrollButton = $state(false);

	function handleSendTextMessage() {
		if (message.trim() === '') return;

		sendTextMessage(lobbyId, socket.id!, message);
		message = '';
	}

	function isNearBottom() {
		if (!messagesContainer) return true;

		const threshold = 120; // px
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer;

		return scrollHeight - (scrollTop + clientHeight) < threshold;
	}

	function scrollToBottom() {
		if (!messagesContainer) return;

		messagesContainer.scrollTo({
			top: messagesContainer.scrollHeight,
			behavior: 'smooth'
		});

		showScrollButton = false;
	}

	function handleScroll() {
		showScrollButton = !isNearBottom();
	}

	$effect(() => {
		const messages = $lobbyMessagesStore;
		if (!messages?.length) return;

		const lastMessage = messages[messages.length - 1];
		const isMe = lastMessage.senderId === socket.id;

		// Always scroll if I sent it
		if (isMe) {
			scrollToBottom();
			return;
		}

		// Otherwise only scroll if near bottom
		if (isNearBottom()) {
			scrollToBottom();
		}
	});
</script>

<div class="drawer w-screen bg-base-200 lg:drawer-open">
	<input id="member-drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex h-svh flex-col overflow-hidden">
		<header class="navbar shrink-0 border-b border-base-300 bg-base-100 px-4">
			<div class="flex flex-1 gap-2">
				<label for="member-drawer" class="btn btn-square btn-ghost btn-sm lg:hidden">
					<Menu />
				</label>
				<div class="flex flex-col justify-center">
					<span class="text-xs leading-none font-bold uppercase opacity-50">Lobby</span>
					<span class="font-mono font-bold text-primary">#{lobbyId}</span>
				</div>
			</div>
			<div class="flex-none">
				<LeaveLobbyButton />
			</div>
		</header>

		<main
			bind:this={messagesContainer}
			onscroll={handleScroll}
			class="relative flex-1 space-y-4 overflow-y-auto p-4"
		>
			{#each $lobbyMessagesStore as msg, i (i)}
				{@const isMe = msg.senderId === socket.id}
				{@const memberData = getMemberFromId(msg.senderId)}
				<div class="chat {isMe ? 'chat-end' : 'chat-start'}">
					<div
						class="chat-header mb-1 text-xs opacity-50"
						style="color: {memberData?.color.foreground};"
					>
						{memberData?.name || 'Unknown'}
					</div>
					{#if msg.type === 'text'}
						<div class="chat-bubble" style="background-color: {memberData?.color.background};">
							{msg.content}
						</div>
					{:else if msg.type === 'game-session-invite'}
						{@const gameSession = $gameSessionsStore[msg.content as string]}
						{@const game = getLocalGameById(gameSession?.gameId)!}

						{#if gameSession && game}
							<div class="chat-bubble max-w-sm p-4 shadow-lg">
								<div class="flex items-start gap-3">
									<div class="avatar">
										<div class="h-12 w-12 rounded-lg bg-base-300 ring-1 ring-secondary-content/20">
											<img src={game.image} alt={game.name} />
										</div>
									</div>

									<div class="flex-1 overflow-hidden">
										<h3 class="flex items-center gap-2 text-sm leading-none font-bold">
											{game.name}
										</h3>

										<div class="mt-2 flex flex-wrap gap-1">
											{#each Object.entries(gameSession.settings) as [key, value], i (i)}
												<div
													class="badge h-4 gap-1 border-none badge-ghost bg-black/10 px-1.5 py-0 text-[10px] opacity-80"
												>
													<span class="font-semibold uppercase">{key.replaceAll('-', ' ')}:</span>
													<span class="max-w-15 truncate italic">
														{Array.isArray(value) ? value.length : value}
													</span>
												</div>
											{/each}
										</div>
									</div>
								</div>

								{#if gameSession.state === 'waiting'}
									<div class="mt-4 grid grid-cols-2 gap-2">
										<JoinGameSessionButton gameSessionId={gameSession.id} />
										<SpectateGameSessionButton gameSessionId={gameSession.id} />
									</div>
								{:else if gameSession.state === 'ongoing'}
									<div class="mt-4 grid grid-cols-2 gap-2">
										<SpectateGameSessionButton gameSessionId={gameSession.id} />
									</div>
								{:else if gameSession.state === 'finished'}
									<div>Game Expired</div>
								{/if}
							</div>
						{:else}
							<div class="chat-bubble chat-bubble-error text-xs italic">
								Invite expired or game not found.
							</div>
						{/if}
					{/if}
				</div>
			{:else}
				<div class="h-full flex flex-col items-center gap-4 justify-center opacity-20">
					<MessageSquareDashed size={32} />
					<p class="text-sm italic">No messages yet</p>
				</div>
			{/each}
		</main>

		{#if showScrollButton}
			<button
				class="btn fixed right-6 bottom-24 btn-circle shadow-lg btn-primary"
				onclick={scrollToBottom}
			>
				<ArrowDown size={16} />
			</button>
		{/if}

		<form
			class="flex shrink-0 gap-2 border-t border-base-300 bg-base-100 p-4"
			onsubmit={(e) => {
				e.preventDefault();
				handleSendTextMessage();
			}}
		>
			<SendGameInviteButton />
			<input
				class="input-bordered input flex-1"
				type="text"
				placeholder="Type a message..."
				bind:value={message}
			/>
			<button class="btn btn-square btn-accent" type="submit" disabled={!message.trim()}
				><Send /></button
			>
		</form>
	</div>

	<div class="drawer-side z-50">
		<label for="member-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="menu min-h-full w-72 border-r border-base-300 bg-base-100 p-0">
			<div class="flex items-center justify-between border-b border-base-300 bg-base-200/50 p-4">
				<h2 class="text-lg font-bold">Members</h2>
				<div class="badge badge-primary">{$membersStore?.length}</div>
			</div>
			<ul class="space-y-1 p-2">
				{#each $membersStore as member, i (i)}
					<li>
						<div class="flex items-center gap-3" style="color: {member.color.foreground}">
							<UserAvatar user={member} />
							<span class="flex-1 truncate">{member.name}</span>
							{#if member.id === $userData.id}
								<span class="badge badge-sm badge-primary">You</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
