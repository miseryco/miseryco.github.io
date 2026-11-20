import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { getFilters, selectProducts, type CategoryFilter, type Product, type SortOrder } from './catalog-model';
import { ProductCard } from './ProductCard';

type CatalogView = { category: CategoryFilter; sort: SortOrder };

function readView(filters: ReturnType<typeof getFilters>): CatalogView {
	const params = new URLSearchParams(window.location.search);
	const category = filters.find(filter => filter.id === params.get('category'))?.id ?? 'all';
	const requestedSort = params.get('sort');
	const sort = requestedSort === 'name-asc' || requestedSort === 'name-desc' ? requestedSort : 'featured';
	return { category, sort };
}

export function Catalog({ products }: { products: readonly Product[] }) {
	const filters = getFilters(products);
	// The server and first client render must match; query state is applied after hydration.
	const [view, setView] = useState<CatalogView>({ category: 'all', sort: 'featured' });
	const [ready, setReady] = useState(false);
	const visibleProducts = selectProducts(products, view.category, view.sort);

	useEffect(() => {
		const restoreView = () => setView(readView(getFilters(products)));
		restoreView();
		setReady(true);
		window.addEventListener('popstate', restoreView);
		return () => window.removeEventListener('popstate', restoreView);
	}, [products]);

	function updateView(next: CatalogView) {
		if (next.category === view.category && next.sort === view.sort) return;
		const url = new URL(window.location.href);
		if (next.category === 'all') url.searchParams.delete('category');
		else url.searchParams.set('category', next.category);
		if (next.sort === 'featured') url.searchParams.delete('sort');
		else url.searchParams.set('sort', next.sort);
		window.history.pushState(null, '', url);
		setView(next);
	}

	return (
		<Tabs.Root value={view.category} onValueChange={category => {
			const filter = filters.find(item => item.id === category);
			if (filter) updateView({ ...view, category: filter.id });
		}}>
			<div className="catalog-toolbar">
				<Tabs.List className="category-tabs" aria-label="Product categories">
					{filters.map(filter => (
						<Tabs.Trigger className="category-tab" key={filter.id} value={filter.id} disabled={!ready}>
							{filter.label}<span className="category-count" aria-hidden="true">{filter.count}</span>
						</Tabs.Trigger>
					))}
				</Tabs.List>
				<label className="sort-control">
					<span>Sort</span>
					<select disabled={!ready} value={view.sort} onChange={event => {
						const sort = event.target.value;
						if (sort === 'featured' || sort === 'name-asc' || sort === 'name-desc') {
							updateView({ ...view, sort });
						}
					}}>
						<option value="featured">Featured</option>
						<option value="name-asc">Name: A–Z</option>
						<option value="name-desc">Name: Z–A</option>
					</select>
				</label>
			</div>
			<div className="catalog-context">
				<p role="status" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}</p>
				<p>Placeholder items aren’t for sale.</p>
			</div>
			{filters.map(filter => (
				<Tabs.Content key={filter.id} value={filter.id} className="catalog-panel">
					{view.category === filter.id ? (
						visibleProducts.length ? (
							<div className="product-grid">
								{visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
							</div>
						) : <p className="empty-catalog">There are no products in this category yet.</p>
					) : null}
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
}
