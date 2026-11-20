import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig, type Connect } from 'vite';
import sharedConfig from '../../vite.config.ts';

function notFoundMiddleware(
	root: string,
	transformHtml?: (html: string, originalUrl: string) => Promise<string>,
): Connect.NextHandleFunction {
	return async (req, res, next) => {
		const accept = req.headers.accept;
		const destination = String(req.headers['sec-fetch-dest'] ?? '');
		if (
			(req.method !== 'GET' && req.method !== 'HEAD') ||
			(accept && !accept.includes('text/html') && !accept.includes('*/*')) ||
			(destination && !['document', 'iframe', 'frame', 'empty'].includes(destination))
		) return next();

		let pathname: string;
		try {
			pathname = decodeURIComponent((req.url ?? '/').split('?')[0]);
		} catch {
			return next();
		}
		// Vite has already resolved directory and extensionless HTML routes.
		// Existing HTML still needs its normal HTML middleware and transforms.
		if (pathname.endsWith('.html') && existsSync(join(root, pathname))) return next();

		try {
			let html = await readFile(join(root, '404.html'), 'utf8');
			if (transformHtml) html = await transformHtml(html, req.originalUrl ?? req.url ?? pathname);
			res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
			res.end(req.method === 'HEAD' ? undefined : html);
		} catch (error) {
			next(error);
		}
	};
}

export default mergeConfig(sharedConfig, defineConfig({
	appType: 'mpa',
	plugins: [{
		name: 'site-not-found',
		configureServer(server) {
			return () => server.middlewares.use(notFoundMiddleware(
				server.config.root,
				(html, originalUrl) => server.transformIndexHtml('/404.html', html, originalUrl),
			));
		},
		configurePreviewServer(server) {
			return () => server.middlewares.use(notFoundMiddleware(
				resolve(server.config.root, server.config.build.outDir),
			));
		},
	}],
	build: {
		rolldownOptions: {
			input: {
				index: fileURLToPath(new URL('./index.html', import.meta.url)),
				notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
			},
		},
	},
}));
