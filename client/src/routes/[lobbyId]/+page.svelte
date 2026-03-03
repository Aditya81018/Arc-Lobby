<script lang="ts">
	import { page } from '$app/state';
	import { socket } from '$lib/socket';
	import { ArrowDown, Menu, MessageSquareDashed, Send } from '@lucide/svelte';
	import { getMemberFromId } from '../../features/lobby/controllers';
	import LeaveLobbyButton from '../../features/lobby/LeaveLobbyButton.svelte';
	import { membersStore } from '../../features/lobby/store';
	import { sendTextMessage } from '../../features/messages/controller';
	import { lobbyMessagesStore } from '../../features/messages/store';

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

<div class="drawer h-screen bg-base-200 lg:drawer-open">
	<input id="member-drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex h-screen flex-col overflow-hidden">
		<header class="navbar shrink-0 border-b border-base-300 bg-base-100 px-4">
			<div class="flex flex-1 gap-2">
				<label for="member-drawer" class="btn btn-ghost btn-sm lg:hidden">
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
			{#each $lobbyMessagesStore as msg}
				{@const isMe = msg.senderId === socket.id}
				<div class="chat {isMe ? 'chat-end' : 'chat-start'}">
					<div class="chat-header mb-1 text-xs opacity-50">
						{getMemberFromId(msg.senderId)?.name || 'Unknown'}
					</div>
					<div
						class="chat-bubble {isMe
							? 'chat-bubble-primary'
							: 'chat-bubble-secondary text-secondary-content'}"
					>
						{msg.content}
					</div>
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
			<input
				class="input-bordered input flex-1"
				type="text"
				placeholder="Type a message..."
				bind:value={message}
			/>
			<button class="btn btn-square btn-primary" type="submit" disabled={!message.trim()}
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
				{#each $membersStore as member}
					<li>
						<div
							class="flex items-center gap-3 {member.id === socket.id
								? 'bg-primary/10 font-medium text-primary'
								: ''}"
						>
							<span class="flex-1 truncate">{member.name}</span>
							{#if member.id === socket.id}
								<span class="badge badge-sm badge-primary">You</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
