import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

const brandDirectory = normalizePath(fileURLToPath(new URL('./packages/brand/', import.meta.url)));

export default defineConfig({
	plugins: [
		{
			name: 'brand-font-preloads',
			apply: 'serve',
			// Match the URL Vite uses for shared CSS assets outside each app's root.
			transformIndexHtml: {
				order: 'pre',
				handler(html) {
					return html.replaceAll('../../packages/brand/', `/@fs/${brandDirectory.replace(/^\//, '')}`);
				},
			},
		},
	],
	build: { assetsInlineLimit: 0 },
});
