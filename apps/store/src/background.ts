// Let product content and controls load before compiling the decorative shader.
let disposed = false;
let stopBackground: (() => void) | undefined;
let idleId: number | undefined;
let timerId: number | undefined;

async function start() {
	if (disposed) return;
	try {
		const { startBackground } = await import('@misery/brand/background');
		if (!disposed) stopBackground = startBackground({ ignorePixelRatio: true });
	} catch (error) {
		console.warn('The decorative background is unavailable.', error);
	}
}

function schedule() {
	if (typeof window.requestIdleCallback === 'function') {
		idleId = window.requestIdleCallback(() => void start(), { timeout: 1000 });
	} else {
		timerId = window.setTimeout(() => void start(), 0);
	}
}

if (document.readyState === 'complete') schedule();
else window.addEventListener('load', schedule, { once: true });

import.meta.hot?.dispose(() => {
	disposed = true;
	window.removeEventListener('load', schedule);
	if (idleId !== undefined) window.cancelIdleCallback(idleId);
	if (timerId !== undefined) window.clearTimeout(timerId);
	stopBackground?.();
});
