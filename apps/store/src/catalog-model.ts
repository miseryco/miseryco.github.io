export const categories = [
	{ id: 'apps', label: 'Mac apps' },
	{ id: 'presets', label: 'Preset banks' },
	{ id: 'goods', label: 'Physical goods' },
] as const;

export type Category = typeof categories[number]['id'];
export type CategoryFilter = 'all' | Category;
export type SortOrder = 'featured' | 'name-asc' | 'name-desc';

export type ProductMedia =
	| { kind: 'image'; src: string; srcSet?: string; alt: string; width: number; height: number; treatment: 'swivel' | 'syphon' | 'workshop' | 'photo' }
	| { kind: 'cover'; palette: 'moss' | 'clay' | 'violet'; title: string; edition: string };

export type Product = {
	id: string;
	name: string;
	category: Category;
	format: string;
	summary: string;
	media: ProductMedia;
} & (
	| { status: 'listed'; destination: { href: string; label: string } }
	| { status: 'placeholder'; details: readonly string[] }
);

// Empty categories stay out of the navigation until a product is added.
export function getFilters(products: readonly Product[]) {
	return [
		{ id: 'all' as const, label: 'All items', count: products.length },
		...categories.flatMap(category => {
			const count = products.filter(product => product.category === category.id).length;
			return count ? [{ ...category, count }] : [];
		}),
	];
}

export function selectProducts(products: readonly Product[], category: CategoryFilter, sort: SortOrder): Product[] {
	const selected = products.filter(product => category === 'all' || product.category === category);
	if (sort !== 'featured') {
		selected.sort((a, b) => a.name.localeCompare(b.name, 'en') * (sort === 'name-desc' ? -1 : 1));
	}
	return selected;
}
