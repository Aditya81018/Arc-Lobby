export interface Game {
	id: string;
	name: string;
	image: string;
	settings?: Record<string, GameSetting>;
	getDefaultData(settings: Game['settings']): unknown;
}

export interface BaseGameSetting<T> {
	id: string;
	name: string;
	type: 'pick-one' | 'pick-many' | 'boolean';
	defaultValue: T;
}

export interface PickOneGameSetting<T> extends BaseGameSetting<T> {
	type: 'pick-one';
	options: {
		name: string;
		value: T;
	}[];
}

export interface PickManyGameSetting<T> extends BaseGameSetting<T[]> {
	type: 'pick-many';
	options: {
		name: string;
		value: T;
	}[];
}

export interface BooleanGameSetting extends BaseGameSetting<boolean> {
	type: 'boolean';
}

export type GameSetting<T = unknown> =
	| PickOneGameSetting<T>
	| PickManyGameSetting<T>
	| BooleanGameSetting;
