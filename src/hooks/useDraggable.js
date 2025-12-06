import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for making an element draggable with responsive positioning.
 * 
 * @param {Object} options
 * @param {string} options.shape - 'circle' or 'rectangle'
 * @param {string} options.position - 'left' or 'right'
 * @param {boolean} options.enabled - Whether dragging is enabled
 * @returns {Object} { ref, style, hasDragged, isDragging }
 */
const useDraggable = ({ shape = 'circle', position = 'right', enabled = true }) => {
    const [style, setStyle] = useState({});
    const [hasDragged, setHasDragged] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const ref = useRef(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const interactionStartedOnRef = useRef(false);

    // Initialize position and handle responsive changes
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

        setStyle(initialStyle);

        const applyMobileStyles = () => {
            if (window.innerWidth <= 640) {
                setStyle(currentStyle => {
                    const newStyle = { ...currentStyle };
                    // Reset explicitly set constrained properties when switching modes if needed
                    // But mostly we just want to ensure safe zones
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
            } else {
                // Desktop - revert to initial if not dragged customized (logic simplified)
                // For now, we re-apply initial style logic on resize to desktop to ensure consistency
                // If user dragged, we might want to keep it, but for responsive safety, resetting is often safer
                if (!hasDragged) {
                    setStyle(initialStyle);
                }
            }
        };

        applyMobileStyles();

        const handleResize = () => {
            applyMobileStyles();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [shape, position]);

    const handleStart = useCallback((e) => {
        if (!enabled) return;

        // Don't drag if clicking close button
        if (e.target.classList.contains('evo-close') || e.target.closest('.evo-close')) {
            return;
        }

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        dragStartPosRef.current = { x: clientX, y: clientY };
        setHasDragged(false);
        setIsDragging(true);

        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            offsetRef.current = {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };

            setStyle(prev => ({
                ...prev,
                cursor: 'grabbing',
                transition: 'none' // Remove transition during drag for responsiveness
            }));
        }

        // Prevent scrolling on touch devices while dragging
        if (e.type === 'touchstart') {
            // passive: false is set in the event listener options
        }
    }, [enabled]);

    const handleMove = useCallback((e) => {
        if (!isDragging || !ref.current) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const deltaX = Math.abs(clientX - dragStartPosRef.current.x);
        const deltaY = Math.abs(clientY - dragStartPosRef.current.y);

        if (deltaX > 5 || deltaY > 5) {
            setHasDragged(true);
        }

        setStyle(prev => ({
            ...prev,
            left: `${clientX - offsetRef.current.x}px`,
            top: `${clientY - offsetRef.current.y}px`,
            right: 'auto',
            bottom: 'auto',
        }));

        if (e.cancelable && e.preventDefault) {
            e.preventDefault();
        }
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
        setStyle(prev => ({
            ...prev,
            cursor: 'grab',
            transition: 'all 0.3s ease' // Restore transition
        }));

        // Let the component consumer reset interactionStartedOnRef if they need to
    }, []);

    // Setup Event Listeners
    useEffect(() => {
        if (!ref.current) return;
        const element = ref.current;

        const onStart = (e) => {
            // Only start if clicking on the element itself or children
            if (element.contains(e.target)) {
                interactionStartedOnRef.current = true;
                handleStart(e);
            } else {
                interactionStartedOnRef.current = false;
            }
        };

        const onMove = (e) => {
            if (interactionStartedOnRef.current && isDragging) {
                handleMove(e);
            }
        };

        const onEnd = (e) => {
            if (interactionStartedOnRef.current) {
                handleEnd(e);
                // Reset flag after a small delay to allow click handlers to fire if it wasn't a drag
                setTimeout(() => {
                    interactionStartedOnRef.current = false;
                }, 100);
            }
        };

        element.addEventListener('mousedown', onStart, { passive: false });
        element.addEventListener('touchstart', onStart, { passive: false });

        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        return () => {
            element.removeEventListener('mousedown', onStart);
            element.removeEventListener('touchstart', onStart);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);
        };
    }, [handleStart, handleMove, handleEnd, isDragging]);

    return {
        ref,
        style,
        hasDragged,
        isDragging
    };
};

export default useDraggable;
