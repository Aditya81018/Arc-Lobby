import { faker } from '@faker-js/faker';

export function getRandomName() {
	return faker.person.firstName();
}

export function getRandomEmoji() {
	return faker.internet.emoji({ types: ['smiley'] });
}

export function getRandomColor() {
	const hue = Math.random() * 360;
	const foreground = `hsl(${hue}, 90%, 80%)`;
	const background = `hsl(${hue}, 70%, 40%)`;
	return { foreground, background };
}
