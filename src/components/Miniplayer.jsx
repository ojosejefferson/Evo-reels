import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MiniPlayer.css';
import ProductModalPortal from './ProductModalPortal';

/**
 * Mini Player Component
 * Based on the unified HTML/CSS/JS code
 */
const MiniPlayer = ({ videoUrl, shape = 'circle', position = 'right', productModalTemplate = 'split-view', productData = {} }) => {
	const [isVisible, setIsVisible] = useState(true);
	const [playerStyle, setPlayerStyle] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasDragged, setHasDragged] = useState(false);
	
	const playerRef = useRef(null);
	const videoRef = useRef(null);
	const isDraggingRef = useRef(false);
	const offsetRef = useRef({ x: 0, y: 0 });
	const dragStartPosRef = useRef({ x: 0, y: 0 });

	// Initialize position based on shape and position props
	useEffect(() => {
		const initialStyle = {};
		
		if (shape === 'circle') {
			initialStyle.bottom = '24px';
			initialStyle.right = position === 'right' ? '24px' : 'auto';
			initialStyle.left = position === 'left' ? '24px' : 'auto';
		} else {
			initialStyle.bottom = '20px';
			initialStyle.left = position === 'left' ? '20px' : 'auto';
			initialStyle.right = position === 'right' ? '20px' : 'auto';
		}

		setPlayerStyle(initialStyle);

		// Responsive adjustments
		const handleResize = () => {
			if (window.innerWidth <= 640 && playerRef.current) {
				setPlayerStyle((currentStyle) => {
					const newStyle = { ...currentStyle };
					if (shape === 'circle') {
						newStyle.bottom = '90px';
						newStyle.right = position === 'right' ? '12px' : 'auto';
						newStyle.left = position === 'left' ? '12px' : 'auto';
					} else {
						newStyle.bottom = '90px';
						newStyle.left = position === 'left' ? '12px' : 'auto';
						newStyle.right = position === 'right' ? '12px' : 'auto';
					}
					return newStyle;
				});
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [shape, position]);

	// Handle drag start
	const handleStart = useCallback((e) => {
		// Don't drag if clicking the close button
		if (e.target.classList.contains('evo-close') || e.target.closest('.evo-close')) {
			return;
		}

		const clientX = e.clientX || (e.touches && e.touches[0].clientX);
		const clientY = e.clientY || (e.touches && e.touches[0].clientY);

		// Store initial position to detect if it's a drag or click
		dragStartPosRef.current = { x: clientX, y: clientY };
		setHasDragged(false);
		isDraggingRef.current = true;

		if (playerRef.current) {
			const rect = playerRef.current.getBoundingClientRect();
			offsetRef.current = {
				x: clientX - rect.left,
				y: clientY - rect.top,
			};

			setPlayerStyle((prev) => ({
				...prev,
				cursor: 'grabbing',
			}));
		}

		if (e.preventDefault) {
			e.preventDefault();
		}
	}, []);

	// Handle drag move
	const handleMove = useCallback((e) => {
		if (!isDraggingRef.current || !playerRef.current) return;

		const clientX = e.clientX || (e.touches && e.touches[0].clientX);
		const clientY = e.clientY || (e.touches && e.touches[0].clientY);

		// Check if user actually dragged (moved more than 5px)
		const deltaX = Math.abs(clientX - dragStartPosRef.current.x);
		const deltaY = Math.abs(clientY - dragStartPosRef.current.y);
		if (deltaX > 5 || deltaY > 5) {
			setHasDragged(true);
		}

		setPlayerStyle((prev) => ({
			...prev,
			left: `${clientX - offsetRef.current.x}px`,
			top: `${clientY - offsetRef.current.y}px`,
			right: 'auto',
			bottom: 'auto',
		}));

		if (e.preventDefault) {
			e.preventDefault();
		}
	}, []);

	// Handle drag end
	const handleEnd = useCallback(() => {
		const hadDragged = hasDragged;
		isDraggingRef.current = false;
		
		setPlayerStyle((prev) => ({
			...prev,
			cursor: 'grab',
		}));

		// If it was a click (not a drag), open modal after a short delay
		setTimeout(() => {
			if (!hadDragged && playerRef.current) {
				setIsModalOpen(true);
			}
			setHasDragged(false);
		}, 100);
	}, [hasDragged]);

	// Handle click to open modal (separate from drag) - disabled, using handleEnd instead
	const handleClick = useCallback((e) => {
		// This is a fallback, but handleEnd should handle it
		// Don't open if clicking close button
		if (e.target.classList.contains('evo-close') || e.target.closest('.evo-close')) {
			return;
		}
	}, []);

	// Setup drag event listeners
	useEffect(() => {
		if (!playerRef.current) return;

		const player = playerRef.current;

		player.addEventListener('mousedown', handleStart);
		player.addEventListener('touchstart', handleStart, { passive: false });
		
		document.addEventListener('mousemove', handleMove);
		document.addEventListener('touchmove', handleMove, { passive: false });
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchend', handleEnd);

		// Add click handler for opening modal
		player.addEventListener('click', handleClick);

		return () => {
			player.removeEventListener('mousedown', handleStart);
			player.removeEventListener('touchstart', handleStart);
			player.removeEventListener('click', handleClick);
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('touchmove', handleMove);
			document.removeEventListener('mouseup', handleEnd);
			document.removeEventListener('touchend', handleEnd);
		};
	}, [handleStart, handleMove, handleEnd, handleClick]);

	// Handle close mini player
	const handleClose = (e) => {
		if (e) {
			e.stopPropagation();
		}
		if (playerRef.current) {
			playerRef.current.style.opacity = '0';
			setTimeout(() => setIsVisible(false), 300);
		}
	};

	// Handle modal close
	const handleModalClose = () => {
		setIsModalOpen(false);
	};

	// Use product data from props, fallback to DOM if not provided
	const finalProductData = Object.keys(productData).length > 0 ? productData : {
		'1': {
			title: document.querySelector('h1.entry-title, .product_title, h1')?.textContent?.trim() || 'Produto',
			price: document.querySelector('.price, .woocommerce-Price-amount')?.textContent?.trim() || '',
			description: document.querySelector('.entry-content, .woocommerce-product-details__short-description')?.textContent?.trim() || '',
			videoUrl: videoUrl,
		}
	};

	if (!isVisible || !videoUrl) {
		return null;
	}

	const playerClass = shape === 'circle' ? 'evo-circle-player' : 'evo-square-player';

	return (
		<>
			<div
				ref={playerRef}
				className={playerClass}
				style={playerStyle}
			>
				<button
					className="evo-close"
					onClick={handleClose}
					onMouseDown={(e) => e.stopPropagation()}
					aria-label="Close player"
				>
					X
				</button>
				<video
					ref={videoRef}
					autoPlay
					loop
					muted
					playsInline
					preload="auto"
				>
					<source src={videoUrl} type="video/mp4" />
				</video>
			</div>
			
			<ProductModalPortal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				template={productModalTemplate}
				videoUrl={videoUrl}
				productData={finalProductData}
			/>
		</>
	);
};

export default MiniPlayer;
