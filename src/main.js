import App from './App.svelte';

import { initialize, options } from "./storage/indexedDB";

options.stores.push({ name: "sprites", options: { keyPath: "key" } });
options.name = "spritepacker";
options.version = 2;
initialize();

const app = new App({
	target: document.body,
	props: {
	}
});

export default app;
