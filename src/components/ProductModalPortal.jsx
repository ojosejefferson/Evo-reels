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
		<>
			{/* Backdrop - behind everything, closes on click */}
			<div 
				className="evo-reels-modal-backdrop"
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0, 0, 0, 0.9)',
					zIndex: 999998,
					pointerEvents: 'auto',
				}}
				onClick={(e) => {
					// Close if clicking directly on backdrop (not on content)
					const target = e.target;
					const currentTarget = e.currentTarget;
					
					// Close if clicking directly on backdrop
					if (target === currentTarget) {
						e.stopPropagation();
						e.preventDefault();
						onClose();
					}
				}}
				onMouseDown={(e) => {
					// Prevent event bubbling to mini player
					e.stopPropagation();
				}}
			/>
			
			{/* Content wrapper - above backdrop, transparent to clicks outside */}
			<div
				className="evo-reels-modal-content-wrapper"
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 999999, // Above backdrop
					pointerEvents: 'none', // Allow backdrop clicks to pass through
					overflow: 'auto',
				}}
				onClick={(e) => {
					// Close if clicking on empty space
					const target = e.target;
					const currentTarget = e.currentTarget;
					
					// Close if clicking directly on wrapper
					if (target === currentTarget) {
						onClose();
						return;
					}
					
					// Close if clicking on container divs outside content
					if (target.classList.contains('evo-reels-product-split-view') || 
						target.classList.contains('evo-reels-product-details-panel')) {
						// Check if click is outside the actual content area
						const contentArea = target.querySelector('.swiper, #main-split-container');
						if (contentArea) {
							const rect = contentArea.getBoundingClientRect();
							const clickX = e.clientX;
							const clickY = e.clientY;
							
							// If click is outside content bounds, close modal
							if (clickX < rect.left || 
								clickX > rect.right || 
								clickY < rect.top || 
								clickY > rect.bottom) {
								onClose();
							}
						} else {
							// No content area found, close modal
							onClose();
						}
					}
				}}
			>
				{/* Content container - enables pointer events and stops propagation */}
				<div
					className="evo-reels-modal-content-inner"
					style={{
						position: 'relative',
						pointerEvents: 'auto', // Enable clicks on content
					}}
					onClick={(e) => {
						// Stop propagation for all content clicks
						e.stopPropagation();
					}}
					onMouseDown={(e) => {
						// Stop propagation for mousedown
						e.stopPropagation();
					}}
					onTouchStart={(e) => {
						// Stop propagation for touch events
						e.stopPropagation();
					}}
				>
					{modalContent}
				</div>
			</div>
		</>,
		portalContainer
	);
};

export default ProductModalPortal;
