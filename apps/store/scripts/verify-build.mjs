import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
const read = path => readFile(new URL(path, output), 'utf8');
const html = await read('index.html');
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const structured = JSON.parse(html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? 'null');
const items = structured?.mainEntity?.itemListElement;

assert(items?.length > 0, 'The catalog must expose its item list in structured data.');
assert.equal((markup.match(/<article\b/g) ?? []).length, items.length, 'All catalog items must be rendered in HTML before JavaScript.');
assert.equal((markup.match(/<h1\b/g) ?? []).length, 1, 'The storefront must have one primary heading.');
assert.match(html, /<link\b[^>]*rel="canonical"[^>]*href="https:\/\/store\.misery\.co\/"/);
assert.match(html, /<meta\b[^>]*name="description"[^>]*content="[^"]+"/);
assert.match(html, /<meta\b[^>]*property="og:image"[^>]*content="https:\/\/store\.misery\.co\//);
assert.doesNotMatch(html, /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/);
assert.match(markup, /href="https:\/\/misery\.co\/swivel"/, 'The product landing-page link must be crawlable.');

for (const item of items) {
	const escapedName = item.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	assert(markup.includes(escapedName), `Missing static product text: ${item.name}`);
	if (item.url.includes('#')) assert(markup.includes(`id="${new URL(item.url).hash.slice(1)}"`), 'Structured-data anchors must resolve.');
}

for (const [, path] of html.matchAll(/\b(?:href|src|component-url|renderer-url)="(\/_astro\/[^"?#]+)"/g)) {
	assert((await stat(new URL(`.${path}`, output))).isFile(), `Missing built asset: ${path}`);
}

const files = await readdir(output, { recursive: true });
const fonts = files.filter(file => file.endsWith('.woff2'));
assert.equal(fonts.length, 1, 'Only the store font should ship.');
assert(fonts[0].includes('scilla-store-subset'));
assert(!files.some(file => /\.(?:ttf|otf)$/i.test(file)), 'Original fonts must not enter deployment output.');
assert.match(await read('robots.txt'), /Sitemap: https:\/\/store\.misery\.co\/sitemap\.xml/);
assert.match(await read('sitemap.xml'), /<loc>https:\/\/store\.misery\.co\/<\/loc>/);
assert.match(await read('404.html'), /name="robots" content="noindex"/);
assert.match(await read('_headers'), /\/_astro\/\*[\s\S]*max-age=31536000, immutable/);

console.log(`Static SEO checks passed: ${items.length} products, metadata, assets, sitemap, 404 and font isolation.`);
