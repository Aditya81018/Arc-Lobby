import { writable } from 'svelte/store';
import { faker } from '@faker-js/faker';

export interface UserData {
  name: string;
}

export const userData = writable<UserData>(
  JSON.parse(localStorage.getItem('user-data')!) || {
    name: faker.person.firstName()
  }
);

userData.subscribe((data) => {
  localStorage.setItem('user-data', JSON.stringify(data));
});
