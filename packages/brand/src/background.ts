import ShaderPad from 'shaderpad';
import autosize from 'shaderpad/plugins/autosize';
import { createFullscreenCanvas } from 'shaderpad/util';
import fragmentShader from './fragment.glsl?raw';

/** Starts the decorative background and returns its cleanup function. */
export function startBackground({ ignorePixelRatio = false } = {}): () => void {
	const canvas = createFullscreenCanvas();
	canvas.className = 'brand-background';
	canvas.setAttribute('aria-hidden', 'true');
	let shader: ShaderPad;

	try {
		shader = new ShaderPad(fragmentShader, {
			plugins: [autosize({ ignorePixelRatio })],
			canvas,
		});
	} catch (error) {
		canvas.remove();
		console.warn('The decorative background is unavailable.', error);
		return () => {};
	}

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const drawStill = () => {
		shader.updateResolution();
		shader.updateUniforms({ u_time: 0 });
		shader.draw();
	};
	const updatePlayback = () => {
		if (reducedMotion.matches || document.hidden) {
			shader.pause();
			if (reducedMotion.matches) drawStill();
		} else {
			shader.play();
		}
	};
	const onResize = () => {
		if (reducedMotion.matches) drawStill();
	};

	shader.on('autosize:resize', onResize);
	reducedMotion.addEventListener('change', updatePlayback);
	document.addEventListener('visibilitychange', updatePlayback);
	updatePlayback();

	return () => {
		reducedMotion.removeEventListener('change', updatePlayback);
		document.removeEventListener('visibilitychange', updatePlayback);
		shader.destroy();
		canvas.remove();
	};
}
