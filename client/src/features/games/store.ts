import { writable } from 'svelte/store';
import type { Game } from './types';

export const gamesStore = writable<Record<string, Game>>({});
