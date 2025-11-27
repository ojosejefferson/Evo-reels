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
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile/desktop
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	}, []);

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
					cursor: 'pointer',
				}}
				onClick={(e) => {
					// Close when clicking directly on backdrop
					// On mobile: content wrapper has pointer-events: none, so clicks pass through
					// On desktop: content wrapper handles clicks, but backdrop is fallback
					if (e.target === e.currentTarget || isMobile) {
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
			
			{/* Content wrapper - different behavior for mobile vs desktop */}
			<div
				className="evo-reels-modal-content-wrapper"
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					minHeight: '100vh',
					display: 'flex',
					alignItems: isMobile ? 'stretch' : 'center',
					justifyContent: 'center',
					zIndex: 999999,
					pointerEvents: isMobile ? 'none' : 'auto', // Mobile: allow backdrop clicks, Desktop: detect overlay clicks
					overflow: isMobile ? 'hidden' : 'auto', // Mobile: no scroll, Desktop: allow scroll
				}}
				onClick={(e) => {
					// Only handle clicks on desktop
					if (isMobile) return;
					
					const target = e.target;
					const currentTarget = e.currentTarget;
					
					// Close if clicking directly on wrapper (empty space/overlay)
					if (target === currentTarget) {
						onClose();
						return;
					}
					
					// Check if click is on content or outside
					const isContentClick = target.closest('.swiper') || 
										  target.closest('#main-split-container') ||
										  target.closest('#desktop-details-panel') ||
										  target.closest('.evo-reels-modal-content-inner') ||
										  target.closest('.evo-reels-video-slide') ||
										  target.closest('.evo-reels-reel-container');
					
					// If not clicking on content, close modal
					if (!isContentClick) {
						onClose();
						return;
					}
					
					// Additional check for container divs - verify if click is outside content bounds
					if (target.classList.contains('evo-reels-product-split-view') || 
						target.classList.contains('evo-reels-product-details-panel')) {
						
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
						}
					}
				}}
			>
				{/* Content container - different behavior for mobile vs desktop */}
				<div
					className="evo-reels-modal-content-inner"
					style={{
						position: 'relative',
						width: '100%',
						height: isMobile ? '100vh' : 'auto',
						minHeight: isMobile ? '100vh' : 'auto',
						pointerEvents: 'auto', // Enable clicks on content
					}}
					onClick={(e) => {
						// Stop propagation for all content clicks (both mobile and desktop)
						e.stopPropagation();
					}}
					onMouseDown={(e) => {
						// Stop propagation for mousedown
						if (!isMobile) {
							e.stopPropagation();
						}
					}}
					onTouchStart={(e) => {
						// Stop propagation for touch events (mobile)
						if (isMobile) {
							e.stopPropagation();
						}
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
