import React, { useState, useCallback } from 'react';
import './MiniPlayer.css';
import ProductModalPortal from './ProductModalPortal';
import useDraggable from '../hooks/useDraggable';

/**
 * Mini Player Component
 * Based on the unified HTML/CSS/JS code
 */
const MiniPlayer = ({ videoUrl, shape = 'circle', position = 'right', productModalTemplate = 'split-view', productData = {} }) => {
	const [isVisible, setIsVisible] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { ref: playerRef, style: playerStyle, hasDragged } = useDraggable({
		shape,
		position
	});

	// Handle close mini player
	const handleClose = useCallback((e) => {
		if (e) {
			e.stopPropagation();
		}
		if (playerRef.current) {
			playerRef.current.style.opacity = '0';
			setTimeout(() => setIsVisible(false), 300);
		}
	}, [playerRef]);

	// Handle modal close
	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	// Handle click to open modal
	const handleClick = useCallback((e) => {
		// Don't open if clicking close button
		if (e.target.classList.contains('evo-close') || e.target.closest('.evo-close')) {
			return;
		}

		// Only open if it wasn't a drag
		if (!hasDragged && !isModalOpen) {
			e.stopPropagation();
			e.preventDefault();
			setIsModalOpen(true);
		}
	}, [hasDragged, isModalOpen]);

	// Bind click event to player ref manually to ensure it plays nice with drag logic
	// The useDraggable hook handles the drag/click distinction via hasDragged state
	// We just need to attach this handler
	React.useEffect(() => {
		const el = playerRef.current;
		if (el) {
			el.addEventListener('click', handleClick);
			return () => el.removeEventListener('click', handleClick);
		}
	}, [playerRef, handleClick]);

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
				productData={productData}
			/>
		</>
	);
};

export default MiniPlayer;
