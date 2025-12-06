import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../index.css';
import './ProductDetailsPanel.css';

const ProductDetailsPanel = ({ productsData = {}, onClose }) => {
	const [activeModal, setActiveModal] = useState(null); // null, 1, or 2
	const [isMuted, setIsMuted] = useState(true);
	const [activeProduct, setActiveProduct] = useState(null);
	const [swiperLoaded, setSwiperLoaded] = useState(false);

	const videoRef = useRef(null);
	const progressFillRef = useRef(null);
	const progressHandleRef = useRef(null);
	const verticalSwiperRef = useRef(null);
	const horizontalSwiper1Ref = useRef(null);
	const horizontalSwiper2Ref = useRef(null);

	// Validate data structure
	const hasProduct1 = productsData['1'] && productsData['1'].video;
	const hasProduct2 = !!productsData['2'];

	// If no valid product 1 data (which contains the main video), we can't really render the main view properly
	// But let's be defensive and perform a check.
	// We use a memoized products object to avoid deep dependency issues, though simple object creation on render is fine here.
	const products = productsData;

	// Safe access helper
	const getProduct = (id) => products[id] || {};

	// Set initial active product
	useEffect(() => {
		if (hasProduct1) {
			setActiveProduct(getProduct('1'));
		}
	}, [productsData, hasProduct1]);

	// Load Swiper Script
	useEffect(() => {
		if (window.Swiper) {
			setSwiperLoaded(true);
		} else {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/swiper/swiper-bundle.min.css';
			document.head.appendChild(link);

			const script = document.createElement('script');
			script.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
			script.onload = () => setSwiperLoaded(true);
			document.body.appendChild(script);
		}
	}, []);

	// Initialize Swipers when script is loaded and component is mounted
	useEffect(() => {
		if (!swiperLoaded || !activeProduct) return;

		// Cleanup previous instances if they exist
		if (verticalSwiperRef.current) verticalSwiperRef.current.destroy();
		if (horizontalSwiper1Ref.current) horizontalSwiper1Ref.current.destroy();
		if (horizontalSwiper2Ref.current) horizontalSwiper2Ref.current.destroy();

		// Vertical Swiper
		const verticalContainer = document.querySelector('#evo-reels-vertical-swiper');
		if (verticalContainer && window.Swiper) {
			verticalSwiperRef.current = new window.Swiper(verticalContainer, {
				direction: 'vertical',
				slidesPerView: 1,
				mousewheel: true,
				allowTouchMove: hasProduct2, // Only allow Swipe if we have a second product
				on: {
					slideChange: function () {
						const activeIndex = this.activeIndex;
						const productId = activeIndex === 0 ? '1' : '2';
						setActiveProduct(getProduct(productId));

						// Handle video play/pause based on slide
						const video = videoRef.current;
						if (video) {
							if (activeIndex === 0) {
								video.play().catch(() => { });
							} else {
								video.pause();
							}
						}
					}
				}
			});
		}

		// Horizontal Swipers
		document.querySelectorAll('.evo-reels-horizontal-swiper').forEach((el, index) => {
			const swiperInstance = new window.Swiper(el, {
				slidesPerView: 1,
				pagination: { el: '.swiper-pagination', clickable: true },
			});
			if (index === 0) horizontalSwiper1Ref.current = swiperInstance;
			if (index === 1) horizontalSwiper2Ref.current = swiperInstance;
		});

		return () => {
			if (verticalSwiperRef.current) verticalSwiperRef.current.destroy();
			if (horizontalSwiper1Ref.current) horizontalSwiper1Ref.current.destroy();
			if (horizontalSwiper2Ref.current) horizontalSwiper2Ref.current.destroy();
		};
	}, [swiperLoaded, productsData, hasProduct2]); // Re-init if data changes significantly

	// Video Progress Logic
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const updateProgress = () => {
			if (video.duration) {
				const percent = (video.currentTime / video.duration) * 100;
				if (progressFillRef.current) progressFillRef.current.style.width = `${percent}%`;
				if (progressHandleRef.current) progressHandleRef.current.style.left = `${percent}%`;
			}
		};

		video.addEventListener('timeupdate', updateProgress);
		video.addEventListener('loadedmetadata', updateProgress);

		// Auto play if it's the first product active
		if (activeProduct && activeProduct.id === 1) {
			video.play().catch(() => { });
		}

		return () => {
			video.removeEventListener('timeupdate', updateProgress);
		};
	}, [activeProduct]);

	const handleSeek = (e) => {
		const video = videoRef.current;
		if (!video) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX || e.touches[0].clientX - rect.left) / rect.width;
		video.currentTime = percent * video.duration;
	};

	const closeModal = () => {
		setActiveModal(null);
	};

	if (!hasProduct1) {
		return null; // Or return a loading state / error message
	}

	const product1 = getProduct('1');
	const product2 = getProduct('2');

	// Safety check for images arrays
	const images1 = product1.images || [];
	const images2 = product2.images || [];

	return (
		<>
			{/* Backdrop for Modals */}
			{activeModal && createPortal(
				<div
					className="fixed inset-0 bg-black/80 z-[1000000]"
					onClick={closeModal}
					style={{ touchAction: 'none' }}
				/>,
				document.body
			)}

			<div className="evo-reels-product-details-panel fixed inset-0 z-[9999] overflow-hidden">

				{/* Main Split Container */}
				<div id="main-split-container" className="w-full h-screen md:h-[683px] md:w-[784px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:flex md:shadow-2xl">

					{/* Vertical Swiper (Reels) */}
					<div className="swiper evo-reels-vertical-swiper w-full h-full md:w-[384px] md:rounded-l-[16px] overflow-hidden" id="evo-reels-vertical-swiper">
						<div className="swiper-wrapper">

							{/* SLIDE 1: Product 1 (Video + Images) */}
							<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-product-id="1">

								{/* Video Progress Bar */}
								<div
									className="evo-reels-video-progress absolute bottom-9 left-5 right-5 h-10 z-30 cursor-pointer"
									onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
									onTouchEnd={(e) => { e.stopPropagation(); handleSeek(e); }}
								>
									<div className="evo-reels-progress-line h-1 bg-white/30 rounded-full relative">
										<div ref={progressFillRef} className="evo-reels-progress-fill absolute h-full bg-white rounded-full transition-all" />
										<div ref={progressHandleRef} className="evo-reels-progress-handle absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 transition-opacity" />
									</div>
								</div>

								{/* Horizontal Swiper 1 */}
								<div className="swiper evo-reels-horizontal-swiper w-full h-full" id="evo-reels-horizontal-swiper-1">
									<div className="swiper-wrapper">
										{/* Video Slide */}
										<div className="swiper-slide relative">
											<video
												ref={videoRef}
												id="evo-reels-video-1"
												preload="metadata"
												loop
												playsInline
												muted={isMuted}
												className="w-full h-full object-cover"
											>
												<source src={product1.video} type="video/mp4" />
											</video>
											<div
												className="play-pause-overlay absolute inset-0 z-10 cursor-pointer"
												onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
											/>
										</div>
										{/* Image Slides */}
										{images1.map((img, i) => (
											<div key={i} className="swiper-slide evo-reels-slide-zoom cursor-crosshair relative">
												<img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
											</div>
										))}
									</div>
									<div className="swiper-pagination bottom-36" />
								</div>

								{/* Top Controls */}
								<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
									<button
										className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
										onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
									>
										{isMuted ? 'Volume Off' : 'Volume On'}
									</button>
									<button
										className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
										onClick={onClose}
									>
										X
									</button>
								</div>

								{/* Footer Mobile (Open Modal 1) */}
								<div
									className="footer swiper-no-swiping pointer-events-auto cursor-pointer z-20 md:hidden absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-transparent/40 to-transparent"
									onClick={(e) => {
										e.stopPropagation();
										setActiveModal(1);
									}}
								>
									<div className="profile flex items-center gap-2 mb-1">
										{/* Placeholder for profile image if not available in data */}
										<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
										<div>
											<div className="product-name font-bold text-base">{product1.title}</div>
											<div className="product-price text-sm font-semibold text-green-400">{product1.price}</div>
										</div>
									</div>
									<div className="desc text-sm leading-snug opacity-90 mt-1">
										{product1.stock ? `${product1.stock} • ` : ''}
										{product1.shipping}
									</div>
								</div>

								{/* Actions */}
								<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
									<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">8.2K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">655K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">8.2K</div></div>
								</div>
							</div>

							{/* SLIDE 2: Product 2 (Images Only) - Only render if product 2 exists */}
							{hasProduct2 && (
								<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-product-id="2">

									{/* Horizontal Swiper 2 */}
									<div className="swiper evo-reels-horizontal-swiper w-full h-full" id="evo-reels-horizontal-swiper-2">
										<div className="swiper-wrapper">
											{images2.map((img, i) => (
												<div key={i} className="swiper-slide evo-reels-slide-zoom cursor-crosshair relative">
													<img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
												</div>
											))}
										</div>
										<div className="swiper-pagination bottom-36" />
									</div>

									{/* Top Controls */}
									<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
										<button
											className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
											onClick={onClose}
										>
											X
										</button>
									</div>

									{/* Footer Mobile (Open Modal 2) */}
									<div
										className="footer swiper-no-swiping pointer-events-auto cursor-pointer z-20 md:hidden absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-transparent/40 to-transparent"
										onClick={(e) => {
											e.stopPropagation();
											setActiveModal(2);
										}}
									>
										<div className="profile flex items-center gap-2 mb-1">
											<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
											<div>
												<div className="product-name font-bold text-base">{product2.title}</div>
												<div className="product-price text-sm font-semibold text-green-400">{product2.price}</div>
											</div>
										</div>
										<div className="desc text-sm leading-snug opacity-90 mt-1">{product2.description ? product2.description.substring(0, 60) + '...' : ''}</div>
									</div>

									{/* Actions */}
									<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
										<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">12.5K</div></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">980</div></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">5.1K</div></div>
									</div>
								</div>
							)}

						</div>
					</div>

					{/* Desktop Details Panel */}
					<div id="desktop-details-panel" className="hidden md:block md:w-[400px] md:h-[683px] bg-white p-8 overflow-y-auto rounded-r-[16px] shadow-2xl text-black flex-shrink-0">
						{activeProduct && (
							<>
								<h2 className="text-3xl font-bold mb-4">{activeProduct.title}</h2>
								<div className="text-4xl font-extrabold mb-6 text-green-600">{activeProduct.price}</div>
								<div className="text-gray-700 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: activeProduct.description }} />

								<button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-full text-lg hover:bg-indigo-700 transition mb-6">
									ADICIONAR AO CARRINHO
								</button>

								<div className="flex flex-col gap-4 text-sm text-gray-700 border-t pt-4">
									{activeProduct.stock && <div className="flex items-center gap-2"><span className="text-indigo-500">🛒</span> <span>{activeProduct.stock}</span></div>}
									{activeProduct.shipping && <div className="flex items-center gap-2"><span className="text-indigo-500">📦</span> <span>{activeProduct.shipping}</span></div>}
									{activeProduct.payment && <div className="flex items-center gap-2"><span className="text-indigo-500">💳</span> <span>{activeProduct.payment}</span></div>}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Modal 1 (Mobile) */}
				{activeModal === 1 && createPortal(
					<div className="evo-reels-modal fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 z-[1000001] overflow-y-auto animate-slide-up" style={{ maxHeight: '85vh' }}>
						<div className="flex justify-between items-center pb-2">
							<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={closeModal}>✕</button>
						</div>
						<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
						{images1[0] && <img src={images1[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Produto" />}
						<h3 className="modal-title text-2xl font-bold mb-2">{product1.title}</h3>
						<div className="modal-price text-3xl font-extrabold mb-3">{product1.price}</div>
						<div className="modal-desc text-base leading-relaxed text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: product1.description }} />
						<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
					</div>,
					document.body
				)}

				{/* Modal 2 (Mobile) */}
				{activeModal === 2 && hasProduct2 && createPortal(
					<div className="evo-reels-modal fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 z-[1000001] overflow-y-auto animate-slide-up" style={{ maxHeight: '85vh' }}>
						<div className="flex justify-between items-center pb-2">
							<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={closeModal}>✕</button>
						</div>
						<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
						{images2[0] && <img src={images2[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Produto" />}
						<h3 className="modal-title text-2xl font-bold mb-2">{product2.title}</h3>
						<div className="modal-price text-3xl font-extrabold mb-3">{product2.price}</div>
						<div className="modal-desc text-base leading-relaxed text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: product2.description }} />
						<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
					</div>,
					document.body
				)}

			</div>
		</>
	);
};

export default ProductDetailsPanel;
