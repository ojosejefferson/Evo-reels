import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ProductDetailsPanel from './ProductDetailsPanel';
import ProductSplitView from './ProductSplitView';

/**
 * Product Modal Portal Component
 * Renders modal in a portal outside the React tree
 */
const ProductModalPortal = ({ isOpen, onClose, template, videoUrl, productData }) => {
	const [portalContainer, setPortalContainer] = useState(null);

	useEffect(() => {
		// Create or get portal container
		let container = document.getElementById('evo-reels-modal-portal');
		
		if (!container) {
			container = document.createElement('div');
			container.id = 'evo-reels-modal-portal';
			container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; pointer-events: none;';
			document.body.appendChild(container);
		}
		
		setPortalContainer(container);

		// Prevent body scroll when modal is open
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			if (!isOpen && container && container.parentNode) {
				// Don't remove container, just reset overflow
				document.body.style.overflow = '';
			}
		};
	}, [isOpen]);

	if (!isOpen || !portalContainer) {
		return null;
	}

	const handleBackdropClick = (e) => {
		// Close if clicking backdrop
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const modalContent = template === 'details-panel' ? (
		<ProductDetailsPanel 
			productsData={productData}
			onClose={onClose}
		/>
	) : (
		<ProductSplitView 
			productsData={productData}
			onClose={onClose}
		/>
	);

	return createPortal(
		<div 
			className="evo-reels-modal-backdrop"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.9)',
				zIndex: 999999,
				overflow: 'auto',
				pointerEvents: 'auto',
			}}
			onClick={handleBackdropClick}
		>
			{modalContent}
		</div>,
		portalContainer
	);
};

export default ProductModalPortal;

