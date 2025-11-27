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
		// Close if clicking directly on backdrop (this should be handled by overlay div now)
		if (e.target === e.currentTarget) {
			e.stopPropagation();
			e.preventDefault();
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
			onMouseDown={(e) => {
				// Prevent event bubbling to mini player
				e.stopPropagation();
			}}
		>
			{/* Invisible overlay to catch clicks outside content */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					zIndex: 1,
				}}
				onClick={(e) => {
					// Close if clicking on this overlay (empty space)
					if (e.target === e.currentTarget) {
						e.stopPropagation();
						e.preventDefault();
						onClose();
					}
				}}
			/>
			
			{/* Content wrapper - stops propagation for content clicks */}
			<div 
				style={{ 
					width: '100%', 
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					zIndex: 2,
				}}
				onClick={(e) => {
					// Stop propagation for all content clicks
					e.stopPropagation();
				}}
				onMouseDown={(e) => {
					// Stop propagation for mousedown too
					e.stopPropagation();
				}}
			>
				{modalContent}
			</div>
		</div>,
		portalContainer
	);
};

export default ProductModalPortal;

