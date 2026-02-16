import { writable } from 'svelte/store';
import { faker } from '@faker-js/faker';
import request from '$lib/request';

export interface UserData {
  id: string;
  name: string;
}

export const userData = writable<UserData>(
  JSON.parse(localStorage.getItem('user-data')!) || {
    id: '',
    name: faker.person.firstName()
  }
);

userData.subscribe((data) => {
  localStorage.setItem('user-data', JSON.stringify(data));
  if (data.id !== '') {
    request(`/users/${data.id}`, 'PUT', data);
  }
});
