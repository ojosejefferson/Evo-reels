import React, { useEffect, useRef } from 'react';
import '../index.css'; // Tailwind CSS compilado (sem CDN, sem vazamento global)
import './ProductSplitView.css';
import { executeProductSplitViewJS } from '../utils/productSplitViewJS';

/**
 * Product Split View Component
 * TikTok Style - Split View with Modal
 */
const ProductSplitView = ({ productsData = {}, onClose }) => {
	const containerRef = useRef(null);
	const scriptLoadedRef = useRef(false);

	useEffect(() => {
		// Load Swiper CSS and JS (Tailwind já está compilado no CSS principal)
		const loadDependencies = () => {
			if (scriptLoadedRef.current) return;

			// Load Swiper CSS
			if (!document.querySelector('link[href*="swiper"]')) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = 'https://unpkg.com/swiper/swiper-bundle.min.css';
				document.head.appendChild(link);
			}

			// Load Swiper JS
			if (!document.querySelector('script[src*="swiper"]')) {
				const script = document.createElement('script');
				script.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
				script.onload = () => {
					scriptLoadedRef.current = true;
					// Execute the template JS
					setTimeout(() => {
						executeProductSplitViewJS(productsData);
					}, 100);
				};
				document.body.appendChild(script);
			} else {
				// Swiper already loaded
				scriptLoadedRef.current = true;
				setTimeout(() => {
					executeProductSplitViewJS(productsData);
				}, 100);
			}
		};

		loadDependencies();

		return () => {
			// Cleanup if needed
		};
	}, [productsData]);

	// Validate data structure
	const hasProduct1 = productsData['1'] && productsData['1'].video;
	const hasProduct2 = !!productsData['2']; // Product 2 is optional

	// Safe access helper
	const getProduct = (id) => productsData[id] || {};

	const product1 = getProduct('1');
	const product2 = getProduct('2');

	// Safety check for images arrays
	const images1 = product1.images || [];
	const images2 = product2.images || [];

	return (
		<div
			ref={containerRef}
			className="evo-reels-product-split-view"
			style={{
				position: 'relative',
				width: '100%',
				height: '100%',
			}}
			onClick={(e) => {
				// Don't stop propagation - let parent handle clicks outside content
				// Only stop if clicking on actual content
				if (e.target.closest('.swiper') ||
					e.target.closest('#main-split-container')) {
					e.stopPropagation();
				}
			}}
			onMouseDown={(e) => {
				// Same logic for mousedown
				if (e.target.closest('.swiper') ||
					e.target.closest('#main-split-container')) {
					e.stopPropagation();
				}
			}}
			onTouchStart={(e) => {
				// Same logic for touch events
				if (e.target.closest('.swiper') ||
					e.target.closest('#main-split-container')) {
					e.stopPropagation();
				}
			}}
		>
			<div id="main-split-container" className="w-full h-screen md:h-[683px] md:flex md:items-center md:justify-center 
					md:w-[384px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
				<div className="swiper evo-reels-vertical-swiper w-full h-full relative overflow-hidden 
							md:w-[384px] md:h-[683px] md:rounded-[36px] md:shadow-2xl md:shadow-black/70" id="evo-reels-vertical-swiper">
					<div className="swiper-wrapper">

						<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-is-video="true">

							<div className="evo-reels-video-progress" id="evo-reels-video-progress-1">
								<div className="evo-reels-progress-line">
									<div className="evo-reels-progress-fill" id="evo-reels-progress-fill-1"></div>
									<div className="evo-reels-progress-handle" id="evo-reels-progress-handle-1"></div>
								</div>
							</div>

							<div className="swiper evo-reels-horizontal-swiper w-full h-full relative" id="evo-reels-horizontal-swiper-1">
								<div className="swiper-wrapper">

									<div className="swiper-slide evo-reels-video-slide relative w-full h-full">

										<div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300 z-10" id="loading-1" style={{
											display: 'none', // Hidden by default, will show if video is not ready
										}}>
											<div className="evo-reels-spinner border-4 border-gray-700 border-solid h-10 w-10 rounded-full"></div>
										</div>

										<video
											id="evo-reels-video-1"
											preload="metadata"
											loop
											playsInline
											muted
											className="w-full h-full object-cover"
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
												display: 'block',
											}}
										>
											<source src={product1.video} type="video/mp4" />
										</video>
										<div className="play-pause-overlay absolute inset-0 z-10 cursor-pointer" id="evo-reels-video-overlay-1"></div>
										<div className="play-pause-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl opacity-0 transition-opacity duration-300 pointer-events-none z-10" id="evo-reels-play-pause-btn-1">Pause</div>
									</div>

									{images1.map((img, i) => (
										<div key={i} className="swiper-slide evo-reels-slide-zoom cursor-crosshair relative">
											<img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
										</div>
									))}

								</div>
								<div className="swiper-pagination"></div>
							</div>

							<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
								<button className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none" id="evo-reels-sound-btn-1" onClick={() => window.toggleSound && window.toggleSound(1)}>Volume Off</button>
								<button
									className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										if (onClose) {
											onClose();
										} else if (window.close) {
											window.close();
										}
									}}
								>
									X
								</button>
							</div>

							<div className="overlay absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent/40 to-transparent text-white pointer-events-none z-10">
								<div className="top"><h4 className="text-xl font-semibold pointer-events-auto">Reels</h4></div>
								<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
									<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">8.2K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">655K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">8.2K</div></div>
								</div>
								<div className="footer pointer-events-auto cursor-pointer z-20" onClick={() => window.openModal && window.openModal(1)}>
									<div className="profile flex items-center gap-2 mb-1">
										{/* Placeholder Profile Image if not in data */}
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
							</div>
						</div>

						{hasProduct2 && (
							<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-is-video="false">
								<div className="swiper evo-reels-horizontal-swiper w-full h-full relative" id="evo-reels-horizontal-swiper-2">
									<div className="swiper-wrapper">

										{images2.map((img, i) => (
											<div key={i} className="swiper-slide evo-reels-slide-zoom cursor-crosshair relative">
												<div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300 z-10" id={`loading-p2-${i}`}>
													<div className="evo-reels-spinner border-4 border-gray-700 border-solid h-10 w-10 rounded-full"></div>
												</div>
												<img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
											</div>
										))}

									</div>
									<div className="swiper-pagination"></div>
								</div>

								<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
									<button
										className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											if (onClose) {
												onClose();
											} else if (window.close) {
												window.close();
											}
										}}
									>
										X
									</button>
								</div>
								<div className="overlay absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent/40 to-transparent text-white pointer-events-none z-10">
									<div className="top"><h4 className="text-xl font-semibold pointer-events-auto">Reels</h4></div>
									<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
										<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">12.5K</div></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">980</div></div>
										<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">5.1K</div></div>
									</div>
									<div className="footer pointer-events-auto cursor-pointer z-20" onClick={() => window.openModal && window.openModal(2)}>
										<div className="profile flex items-center gap-2 mb-1">
											<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
											<div>
												<div className="product-name font-bold text-base">{product2.title}</div>
												<div className="product-price text-sm font-semibold text-green-400">{product2.price}</div>
											</div>
										</div>
										<div className="desc text-sm leading-snug opacity-90 mt-1">{product2.description ? product2.description.substring(0, 60) + '...' : ''}</div>
									</div>
								</div>
							</div>
						)}

					</div>
				</div>
			</div>

			<div className="evo-reels-modal fixed bottom-[-100%] left-1/2 -translate-x-1/2 w-full max-w-[384px] max-h-[90vh] bg-white rounded-t-[32px] p-5 transition-all duration-400 ease-in-out shadow-xl z-[999] overflow-y-auto" id="modal1">
				<div className="flex justify-between items-center pb-2">
					<button
						className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold"
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							if (onClose) {
								onClose();
							} else if (window.closeModal) {
								window.closeModal();
							}
						}}
					>
						✕
					</button>
				</div>
				<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
				{images1[0] && <img src={images1[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Produto" />}
				<h3 className="modal-title text-2xl font-bold mb-2">{product1.title}</h3>
				<div className="modal-price text-3xl font-extrabold mb-3">{product1.price}</div>
				<div className="modal-desc text-base leading-relaxed text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: product1.description }} />
				<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
			</div>

			{hasProduct2 && (
				<div className="evo-reels-modal fixed bottom-[-100%] left-1/2 -translate-x-1/2 w-full max-w-[384px] max-h-[90vh] bg-white rounded-t-[32px] p-5 transition-all duration-400 ease-in-out shadow-xl z-[999] overflow-y-auto" id="modal2">
					<div className="flex justify-between items-center pb-2">
						<button
							className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold"
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								if (onClose) {
									onClose();
								} else if (window.closeModal) {
									window.closeModal();
								}
							}}
						>
							✕
						</button>
					</div>
					<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
					{images2[0] && <img src={images2[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Produto" />}
					<h3 className="modal-title text-2xl font-bold mb-2">{product2.title}</h3>
					<div className="modal-price text-3xl font-extrabold mb-3">{product2.price}</div>
					<div className="modal-desc text-base leading-relaxed text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: product2.description }} />
					<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
				</div>
			)}
		</div>
	);
};

export default ProductSplitView;
