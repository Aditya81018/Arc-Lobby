import { writable } from 'svelte/store';
import request from '$lib/request';
import { getRandomColor, getRandomEmoji, getRandomName } from './controllers';

export interface UserData {
	id: string;
	name: string;
	emoji: string;
	color: { foreground: string; background: string };
}

export const userData = writable<UserData>(getInitialData());

function getInitialData() {
	const data = JSON.parse(localStorage.getItem('user-data')!) || {};
	return {
		id: '',
		name: getRandomName(),
		emoji: getRandomEmoji(),
		color: getRandomColor(),
		...data
	} as UserData;
}

userData.subscribe((data) => {
	localStorage.setItem('user-data', JSON.stringify({ ...data, id: '' }));
	if (data.id !== '') {
		request<UserData>(`/users/${data.id}`, 'PUT', data);
	}
});
