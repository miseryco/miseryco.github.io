import type { Product } from './catalog-model';

function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
	return (
		<svg className={`arrow arrow-${direction}`} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 12h14m-6-6 6 6-6 6" />
		</svg>
	);
}

function ProductArtwork({ product }: { product: Product }) {
	const { media } = product;
	if (media.kind === 'image') {
		return (
			<div className={`product-art art-${media.treatment}`}>
				<img
					src={media.src}
					srcSet={media.srcSet}
					sizes="(min-width: 1025px) 390px, (min-width: 641px) 46vw, (min-width: 368px) calc((100vw - 52px) / 2), calc(100vw - 40px)"
					alt={media.alt} width={media.width} height={media.height}
					loading={product.id === 'swivel' ? 'eager' : 'lazy'}
					fetchPriority={product.id === 'swivel' ? 'high' : 'auto'}
					decoding="async"
				/>
			</div>
		);
	}

	return (
		<div className={`product-art bank-cover cover-${media.palette}`} aria-hidden="true">
			<svg className="cover-geometry" viewBox="0 0 400 250" fill="none">
				{media.palette === 'moss' ? Array.from({ length: 8 }, (_, i) => (
					<ellipse key={i} cx="310" cy="-15" rx={48 + i * 22} ry={35 + i * 18} />
				)) : media.palette === 'clay' ? Array.from({ length: 7 }, (_, i) => (
					<path key={i} d={`M${170 + i * 22} -20v${80 + i * 16}h${130 - i * 10}v180`} />
				)) : Array.from({ length: 7 }, (_, i) => (
					<circle key={i} cx={255 + i * 13} cy={25 + i * 6} r={25 + i * 16} />
				))}
			</svg>
			<span className="cover-title">{media.title}</span>
			<div className="cover-caption"><span>{media.edition}</span><span>JD-08</span></div>
		</div>
	);
}

export function ProductCard({ product }: { product: Product }) {
	return (
		<article id={product.id} className="product-card" aria-labelledby={`${product.id}-name`}>
			<div className="product-visual">
				{product.status === 'listed' ? (
					<a href={product.destination.href} aria-label={`View ${product.name}`}>
						<ProductArtwork product={product} />
					</a>
				) : <ProductArtwork product={product} />}
				{product.status === 'placeholder' ? <span className="placeholder-label">Placeholder</span> : null}
			</div>
			<div className="product-body">
				<h2 id={`${product.id}-name`}>{product.name}</h2>
				<p className="product-format">{product.format}</p>
				<p className="product-summary">{product.summary}</p>
				{product.status === 'listed' ? (
					<a className="product-action" href={product.destination.href} aria-label={`View ${product.name}`}>
						{product.destination.label}<Arrow />
					</a>
				) : (
					<details className="product-details">
						<summary className="product-action" aria-label={`Preview ${product.name} details`}>Preview details<Arrow direction="down" /></summary>
						<div className="details-copy">
							{product.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
							<p className="availability-note">Not available to buy yet.</p>
						</div>
					</details>
				)}
			</div>
		</article>
	);
}
