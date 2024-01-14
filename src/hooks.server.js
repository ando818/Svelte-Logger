import {logs} from '$lib/logstore.js';
import { json } from '@sveltejs/kit';

import { get, writable } from 'svelte/store';

export async function handle({ event, resolve }) {


	if (event.url.pathname.startsWith('/postLog')) {
		let text = await event.request.text();
		let newLog = JSON.parse(text);
		logs.update((logs) => logs.concat(newLog));
		return new Response(JSON.stringify(get(logs)));
	}

	if (event.url.pathname.startsWith('/getLogs')) {
		return new Response(JSON.stringify(get(logs)));
	}

	if (event.url.pathname.startsWith('/clearLogs')) {
		logs.update((logs) => []);
		return new Response(JSON.stringify(get(logs)));
	}
	const response = await resolve(event);
	return response;
}