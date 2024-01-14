import { persisted } from 'svelte-local-storage-store'
import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

function getFromStorage(key) {
    if (browser) {
        const item = localStorage.getItem(key);
        let result = null;
        try {
            result = JSON.parse(item);
        } catch (e) {
            localStorage.setItem(key, null);
            return null;
        }
        return result;
    } else {
        return null
    }
}

export const logs = writable([]);

logs.subscribe((u) => {
    if (browser) {
        localStorage.setItem('logs', JSON.stringify(u));
    }
});


export const enableConsole = writable(
    getFromStorage('enableConsole')
);

enableConsole.subscribe((u) => {
    if (browser) {
        localStorage.setItem('enableConsole', JSON.stringify(u));
    }
});

if (!get(logs)){
logs.set([])
}