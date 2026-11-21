import { getImage } from 'astro:assets';
import type { Product } from './catalog-model';
import swivelOverview from './assets/swivel-overview.webp';
import syphonPreview from './assets/syphon-preview.webp';
import workshopPreview from './assets/jd08-workshop-preview.webp';

const [swivelImage, syphonImage, workshopImage] = await Promise.all(
	[swivelOverview, syphonPreview, workshopPreview].map(src => getImage({
		src, width: Math.min(720, src.width), widths: [360, 720, 1080].filter(width => width < src.width).concat(src.width),
		format: 'webp', quality: 80,
	})),
);

export const products: readonly Product[] = [
	{
		id: 'swivel',
		name: 'Swivel',
		category: 'apps',
		format: 'Mac app',
		summary: 'Automatic camera switching. Look at a camera, and Swivel switches to it.',
		media: {
			kind: 'image', src: swivelImage.src, srcSet: swivelImage.srcSet.attribute, treatment: 'swivel', width: 1440, height: 900,
			alt: 'Swivel’s overview showing three cameras and the Mac app’s live video output.',
		},
		status: 'listed',
		destination: { href: 'https://misery.co/swivel', label: 'View product' },
	},
	{
		id: 'syphon',
		name: 'Syphon',
		category: 'apps',
		format: 'Mac app',
		summary: 'Turn audio files, software instruments, and MIDI hardware into sample libraries.',
		media: {
			kind: 'image', src: syphonImage.src, srcSet: syphonImage.srcSet.attribute, treatment: 'syphon',
			width: syphonPreview.width, height: syphonPreview.height,
			alt: 'Syphon’s loop editor showing the attack and a 2.41-second sustain loop on a sampled Dexed C4.',
		},
		status: 'listed',
		destination: { href: 'https://misery.co/syphon/', label: 'View product' },
	},
	{
		id: 'jd08-workshop',
		name: 'JD-08 Workshop',
		category: 'apps',
		format: 'Mac app',
		summary: 'A patch editor and librarian for exploring and organizing your JD-08.',
		media: {
			kind: 'image', src: workshopImage.src, srcSet: workshopImage.srcSet.attribute, treatment: 'workshop',
			width: workshopPreview.width, height: workshopPreview.height,
			alt: 'JD-08 Toolkit’s patch library beside the synth editor, with Tone A’s filter envelope open.',
		},
		status: 'listed',
		destination: { href: 'https://misery.co/jd-08-toolkit/', label: 'View product' },
	},
	{
		id: 'quiet-cartographies',
		name: 'Quiet Cartographies',
		category: 'presets',
		format: 'JD-08 · 24 presets',
		summary: 'Slowly changing harmony and weathered electronic textures for the JD-08.',
		media: { kind: 'cover', palette: 'moss', title: 'Quiet Cartographies', edition: '24 ambient presets' },
		status: 'placeholder',
		details: [
			'A collection of 24 ambient presets for the Roland JD-08.',
			'The final download format, price, and installation instructions are still to be confirmed.',
		],
	},
	{
		id: 'living-architecture',
		name: 'Living Architecture',
		category: 'presets',
		format: 'JD-08 · 24 presets',
		summary: 'A collection of 24 four-tone sounds for the JD-08.',
		media: { kind: 'cover', palette: 'clay', title: 'Living Architecture', edition: '24 four-tone sounds' },
		status: 'placeholder',
		details: [
			'24 JD-08 sounds built from four tones, with individually voiced progressions in the source collection.',
			'The final download format, price, and installation instructions are still to be confirmed.',
		],
	},
	{
		id: 'velvet-constellations',
		name: 'Velvet Constellations',
		category: 'presets',
		format: 'JD-08 · 24 presets',
		summary: 'Four-tone pads across six families of JD-08 sounds.',
		media: { kind: 'cover', palette: 'violet', title: 'Velvet Constellations', edition: '24 four-tone pads' },
		status: 'placeholder',
		details: [
			'A collection of 24 four-tone pads in six families for the Roland JD-08.',
			'The final download format, price, and installation instructions are still to be confirmed.',
		],
	},
];

