import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
	site: 'https://store.misery.co',
	output: 'static',
	server: { port: 5174 },
	integrations: [react()],
	vite: {
		build: { assetsInlineLimit: 0 },
	},
});
