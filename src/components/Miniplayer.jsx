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
	const interactionStartedOnPlayerRef = useRef(false);

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
	const handleEnd = useCallback((e) => {
		const hadDragged = hasDragged;
		isDraggingRef.current = false;
		
		setPlayerStyle((prev) => ({
			...prev,
			cursor: 'grab',
		}));

		// If it was a click (not a drag), open modal after a short delay
		// But only if modal is not already open (prevent reopening)
		// And only if interaction started on the player
		if (interactionStartedOnPlayerRef.current) {
			setTimeout(() => {
				if (!hadDragged && playerRef.current && !isModalOpen) {
					if (e) {
						e.stopPropagation();
					}
					setIsModalOpen(true);
				}
				setHasDragged(false);
			}, 100);
		} else {
			setHasDragged(false);
		}
	}, [hasDragged, isModalOpen]);

	// Handle click to open modal - ONLY if it's a real click (not drag)
	const handleClick = useCallback((e) => {
		// Don't open if clicking close button
		if (e.target.classList.contains('evo-close') || e.target.closest('.evo-close')) {
			return;
		}
		
		// Only open if it wasn't a drag and interaction started on player
		if (!hasDragged && interactionStartedOnPlayerRef.current && !isModalOpen) {
			e.stopPropagation();
			e.preventDefault();
			setIsModalOpen(true);
		}
	}, [hasDragged, isModalOpen]);

	// Setup drag event listeners - ONLY on player element
	useEffect(() => {
		if (!playerRef.current) return;

		const player = playerRef.current;

		// Handler to check if interaction started on player
		const handleInteractionStart = (e) => {
			// CRITICAL: Only process if event started on the player or its children
			if (player.contains(e.target)) {
				interactionStartedOnPlayerRef.current = true;
				handleStart(e);
			} else {
				// Reset if interaction didn't start on player
				interactionStartedOnPlayerRef.current = false;
			}
		};

		// Handler for move - only if started on player
		const handleInteractionMove = (e) => {
			if (interactionStartedOnPlayerRef.current && isDraggingRef.current) {
				handleMove(e);
			}
		};

		// Handler for end - only if started on player
		const handleInteractionEnd = (e) => {
			// CRITICAL: Only process if interaction started AND ended on player
			if (interactionStartedOnPlayerRef.current && player.contains(e.target)) {
				handleEnd(e);
				// Reset after processing
				setTimeout(() => {
					interactionStartedOnPlayerRef.current = false;
				}, 150);
			} else {
				// Reset if interaction didn't start/end on player
				interactionStartedOnPlayerRef.current = false;
				isDraggingRef.current = false;
				setHasDragged(false);
			}
		};

		// Add listeners ONLY on player element
		player.addEventListener('mousedown', handleInteractionStart, { passive: false });
		player.addEventListener('touchstart', handleInteractionStart, { passive: false });
		
		// Document listeners for move/end (but only process if started on player)
		document.addEventListener('mousemove', handleInteractionMove, { passive: false });
		document.addEventListener('touchmove', handleInteractionMove, { passive: false });
		document.addEventListener('mouseup', handleInteractionEnd);
		document.addEventListener('touchend', handleInteractionEnd);

		// Add click handler ONLY on player
		player.addEventListener('click', handleClick, { passive: false });

		return () => {
			player.removeEventListener('mousedown', handleInteractionStart);
			player.removeEventListener('touchstart', handleInteractionStart);
			player.removeEventListener('click', handleClick);
			document.removeEventListener('mousemove', handleInteractionMove);
			document.removeEventListener('touchmove', handleInteractionMove);
			document.removeEventListener('mouseup', handleInteractionEnd);
			document.removeEventListener('touchend', handleInteractionEnd);
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
	const finalProductData = Object.keys(productData).length > 0 ? productData : (() => {
		// Try to get clean price from DOM (strip HTML)
		const priceElement = document.querySelector('.price, .woocommerce-Price-amount');
		let cleanPrice = '';
		if (priceElement) {
			// Get text content only, no HTML
			cleanPrice = priceElement.textContent?.trim() || priceElement.innerText?.trim() || '';
		}
		
		return {
			'1': {
				title: document.querySelector('h1.entry-title, .product_title, h1')?.textContent?.trim() || 'Produto',
				price: cleanPrice,
				description: document.querySelector('.entry-content, .woocommerce-product-details__short-description')?.textContent?.trim() || '',
				videoUrl: videoUrl,
			}
		};
	})();

	if (!isVisible || !videoUrl) {
		return null;
	}

	const playerClass = shape === 'circle' ? 'evo-circle-player' : 'evo-square-player';

	return (
		<>
			<div
				ref={playerRef}
				className={playerClass}
				style={{
					...playerStyle,
					touchAction: 'none', // Prevent default touch behaviors
				}}
			>
				<button
					className="evo-close"
					onClick={handleClose}
					onMouseDown={(e) => e.stopPropagation()}
					onTouchStart={(e) => e.stopPropagation()}
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
					style={{
						touchAction: 'none', // Prevent video touch conflicts
					}}
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
