import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Tailwind CSS compilado (sem CDN, sem vazamento global)
import ProductDetailsPanel from './components/ProductDetailsPanel';
import ProductSplitView from './components/ProductSplitView';

/**
 * Initialize Evo Reels Product Modal
 * Reads configuration from WordPress wp_localize_script
 */
const initEvoReelsProductModal = () => {
	const rootElement = document.getElementById('evo-reels-product-modal-root');

	if (!rootElement) {
		return;
	}

	// Get configuration from WordPress
	const config = window.evoReelsProductModalConfig || {};

	// Get template type from config
	const template = config.productModalTemplate || 'split-view';
	const productsData = config.productsData || {};

	// Create React root and render
	const root = createRoot(rootElement);
	
	if (template === 'details-panel') {
		root.render(
			<React.StrictMode>
				<ProductDetailsPanel productsData={productsData} />
			</React.StrictMode>
		);
	} else {
		// Default to split-view
		root.render(
			<React.StrictMode>
				<ProductSplitView productsData={productsData} />
			</React.StrictMode>
		);
	}
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initEvoReelsProductModal);
} else {
	initEvoReelsProductModal();
}

