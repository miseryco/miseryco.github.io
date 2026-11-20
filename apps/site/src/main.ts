import { startBackground } from '@misery/brand/background';

const stopBackground = startBackground();
import.meta.hot?.dispose(stopBackground);
