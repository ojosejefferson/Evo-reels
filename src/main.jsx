import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MiniPlayer from './components/MiniPlayer';

/**
 * Initialize Evo Reels Mini Player
 * Reads configuration from WordPress wp_localize_script
 */
(function() {
	'use strict';
	
	const initEvoReels = () => {
		// Wait for DOM to be fully ready
		const checkAndInit = () => {
			const rootElement = document.getElementById('evo-reels-root');

			if (!rootElement) {
				console.warn('Evo Reels: Root element #evo-reels-root not found. Retrying...');
				return false;
			}

			// Get configuration from WordPress
			const config = window.evoReelsConfig || {};

			if (!config || !config.videoUrl) {
				console.warn('Evo Reels: No video URL configured. Config:', config);
				return false;
			}

			// Create React root and render
			try {
			const root = createRoot(rootElement);
			root.render(
				<React.StrictMode>
					<MiniPlayer
						videoUrl={config.videoUrl}
						shape={config.shape || 'circle'}
						position={config.position || 'right'}
						productModalTemplate={config.productModalTemplate || 'split-view'}
						productData={config.productData || {}}
					/>
				</React.StrictMode>
			);
				console.log('Evo Reels: Mini player initialized successfully');
				return true;
			} catch (error) {
				console.error('Evo Reels: Error initializing player:', error);
				return false;
			}
		};

		// Try multiple times with increasing delays
		let attempts = 0;
		const maxAttempts = 10;
		
		const tryInit = () => {
			attempts++;
			if (checkAndInit()) {
				return; // Success
			}
			
			if (attempts < maxAttempts) {
				setTimeout(tryInit, 200 * attempts); // Exponential backoff
			} else {
				console.error('Evo Reels: Failed to initialize after', maxAttempts, 'attempts');
			}
		};

		// Start trying
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				setTimeout(tryInit, 100);
			});
		} else {
			// DOM already ready
			setTimeout(tryInit, 100);
		}
	};

	// Start initialization
	initEvoReels();
})();

