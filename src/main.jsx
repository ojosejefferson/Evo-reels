import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MiniPlayer from './components/MiniPlayer';

/**
 * Initialize Evo Reels Mini Player
 * Reads configuration from WordPress wp_localize_script
 */
const initEvoReels = () => {
	const rootElement = document.getElementById('evo-reels-root');

	if (!rootElement) {
		return;
	}

	// Get configuration from WordPress
	const config = window.evoReelsConfig || {};

	if (!config.videoUrl) {
		return;
	}

	// Create React root and render
	const root = createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<MiniPlayer
				videoUrl={config.videoUrl}
				shape={config.shape || 'circle'}
				position={config.position || 'right'}
			/>
		</React.StrictMode>
	);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initEvoReels);
} else {
	initEvoReels();
}

