import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../index.css';
import './ProductDetailsPanel.css';

const ProductDetailsPanel = ({ productsData = {}, onClose }) => {
	const [activeModal, setActiveModal] = useState(null); // null, 1, or 2
	const [isMuted, setIsMuted] = useState(true);
	const [activeProduct, setActiveProduct] = useState(null);
	const videoRef = useRef(null);
	const progressFillRef = useRef(null);
	const progressHandleRef = useRef(null);

	// Default products data matching the HTML template
	const defaultProducts = {
		'1': {
			id: 1,
			title: "Jaqueta Branca Premium",
			price: "R$ 399,90",
			description: "Tecido premium italiano, acabamento perfeito. Esta jaqueta é a peça chave para qualquer estação, combinando estilo e durabilidade. Edição limitada.",
			stock: "Em estoque, poucas unidades.",
			shipping: "Frete grátis acima de R$299",
			payment: "Parcelamento em até 12x sem juros.",
			video: "https://maksantos.com.br/wp-content/uploads/2024/12/VIDEO-MAKSANTOS-REELS-32-.mp4",
			images: [
				"https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg",
				"https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg",
				"https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg"
			]
		},
		'2': {
			id: 2,
			title: "Tênis Lifestyle Vermelho",
			price: "R$ 559,99",
			description: "Lançamento da coleção, solado com tecnologia de amortecimento e design moderno. Leve o estilo para onde for! Disponível em vários tamanhos.",
			stock: "Disponível para pré-venda.",
			shipping: "Envio imediato.",
			payment: "Parcelamento em até 6x sem juros.",
			video: null,
			images: [
				"https://images.unsplash.com/photo-1542291026-7eec264c27fc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
				"https://images.unsplash.com/photo-1605342415174-8d4ed0c5c364?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
			]
		}
	};

	// Merge provided data with defaults to ensure all fields (like images) exist
	// Also handle the case where productsData['1'] exists but doesn't have images
	const products = {
		'1': { ...defaultProducts['1'], ...(productsData['1'] || {}) },
		'2': { ...defaultProducts['2'], ...(productsData['2'] || {}) }
	};

	// Handle videoUrl vs video property mismatch
	if (products['1'].videoUrl && !products['1'].video) {
		products['1'].video = products['1'].videoUrl;
	}

	// Ensure images array exists even if defaults failed (defensive)
	if (!products['1'].images) products['1'].images = defaultProducts['1'].images;
	if (!products['2'].images) products['2'].images = defaultProducts['2'].images;

	// Set initial active product
	useEffect(() => {
		setActiveProduct(products['1']);
	}, []);

	// Load Swiper
	useEffect(() => {
		if (!window.Swiper) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/swiper/swiper-bundle.min.css';
			document.head.appendChild(link);

			const script = document.createElement('script');
			script.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
			script.onload = initializeSwipers;
			document.body.appendChild(script);
		} else {
			initializeSwipers();
		}
	}, []);

	const initializeSwipers = () => {
		setTimeout(() => {
			// Vertical Swiper
			const verticalSwiper = new window.Swiper('#evo-reels-vertical-swiper', {
				direction: 'vertical',
				slidesPerView: 1,
				mousewheel: true,
				on: {
					slideChange: function () {
						const activeIndex = this.activeIndex;
						const productId = activeIndex === 0 ? '1' : '2';
						setActiveProduct(products[productId]);

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

			// Horizontal Swipers
			new window.Swiper('#evo-reels-horizontal-swiper-1', {
				slidesPerView: 1,
				pagination: { el: '.swiper-pagination', clickable: true },
			});

			new window.Swiper('#evo-reels-horizontal-swiper-2', {
				slidesPerView: 1,
				pagination: { el: '.swiper-pagination', clickable: true },
			});

		}, 100);
	};

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
		video.play().catch(() => { });

		return () => {
			video.removeEventListener('timeupdate', updateProgress);
		};
	}, []);

	const handleSeek = (e) => {
		const video = videoRef.current;
		if (!video) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX || e.touches[0].clientX - rect.left) / rect.width;
		video.currentTime = percent * video.duration;
	};

	const closeModal = () => {
		console.log('Closing Modal');
		setActiveModal(null);
	};

	return (
		<>
			{/* Backdrop for Modals - Rendered via Portal */}
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
												<source src={products['1'].video} type="video/mp4" />
											</video>
											<div
												className="play-pause-overlay absolute inset-0 z-10 cursor-pointer"
												onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
											/>
										</div>
										{/* Image Slides */}
										{products['1'].images.map((img, i) => (
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
										console.log('Clicked footer 1');
										setActiveModal(1);
									}}
								>
									<div className="profile flex items-center gap-2 mb-1">
										<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
										<div>
											<div className="product-name font-bold text-base">{products['1'].title}</div>
											<div className="product-price text-sm font-semibold text-green-400">{products['1'].price}</div>
										</div>
									</div>
									<div className="desc text-sm leading-snug opacity-90 mt-1">Frete grátis acima de R$299 • Edição limitada • Todo Brasil</div>
								</div>

								{/* Actions */}
								<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
									<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">8.2K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">655K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">8.2K</div></div>
								</div>
							</div>

							{/* SLIDE 2: Product 2 (Images Only) */}
							<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-product-id="2">

								{/* Horizontal Swiper 2 */}
								<div className="swiper evo-reels-horizontal-swiper w-full h-full" id="evo-reels-horizontal-swiper-2">
									<div className="swiper-wrapper">
										{products['2'].images.map((img, i) => (
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
										console.log('Clicked footer 2');
										setActiveModal(2);
									}}
								>
									<div className="profile flex items-center gap-2 mb-1">
										<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
										<div>
											<div className="product-name font-bold text-base">{products['2'].title}</div>
											<div className="product-price text-sm font-semibold text-green-400">{products['2'].price}</div>
										</div>
									</div>
									<div className="desc text-sm leading-snug opacity-90 mt-1">Design exclusivo • Lançamento da coleção outono/inverno.</div>
								</div>

								{/* Actions */}
								<div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
									<div><button className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none">COMPRAR</button></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">❤️</button><div className="count text-xs text-center mt-1">12.5K</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">💬</button><div className="count text-xs text-center mt-1">980</div></div>
									<div><button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">🔗</button><div className="count text-xs text-center mt-1">5.1K</div></div>
								</div>
							</div>

						</div>
					</div>

					{/* Desktop Details Panel */}
					<div id="desktop-details-panel" className="hidden md:block md:w-[400px] md:h-[683px] bg-white p-8 overflow-y-auto rounded-r-[16px] shadow-2xl text-black flex-shrink-0">
						{activeProduct && (
							<>
								<h2 className="text-3xl font-bold mb-4">{activeProduct.title}</h2>
								<div className="text-4xl font-extrabold mb-6 text-green-600">{activeProduct.price}</div>
								<p className="text-gray-700 leading-relaxed mb-8">{activeProduct.description}</p>

								<button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-full text-lg hover:bg-indigo-700 transition mb-6">
									ADICIONAR AO CARRINHO
								</button>

								<div className="flex flex-col gap-4 text-sm text-gray-700 border-t pt-4">
									<div className="flex items-center gap-2"><span className="text-indigo-500">🛒</span> <span>{activeProduct.stock}</span></div>
									<div className="flex items-center gap-2"><span className="text-indigo-500">📦</span> <span>{activeProduct.shipping}</span></div>
									<div className="flex items-center gap-2"><span className="text-indigo-500">💳</span> <span>{activeProduct.payment}</span></div>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Modal 1 (Mobile) - Rendered via Portal */}
				{activeModal === 1 && createPortal(
					<div className="evo-reels-modal fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 z-[1000001] overflow-y-auto animate-slide-up" style={{ maxHeight: '85vh' }}>
						<div className="flex justify-between items-center pb-2">
							<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={closeModal}>✕</button>
						</div>
						<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
						<img src={products['1'].images[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Jaqueta" />
						<h3 className="modal-title text-2xl font-bold mb-2">{products['1'].title}</h3>
						<div className="modal-price text-3xl font-extrabold mb-3">{products['1'].price}</div>
						<p className="modal-desc text-base leading-relaxed text-gray-600 mb-8">{products['1'].description}</p>
						<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
					</div>,
					document.body
				)}

				{/* Modal 2 (Mobile) - Rendered via Portal */}
				{activeModal === 2 && createPortal(
					<div className="evo-reels-modal fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 z-[1000001] overflow-y-auto animate-slide-up" style={{ maxHeight: '85vh' }}>
						<div className="flex justify-between items-center pb-2">
							<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={closeModal}>✕</button>
						</div>
						<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
						<img src={products['2'].images[0]} className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Tênis" />
						<h3 className="modal-title text-2xl font-bold mb-2">{products['2'].title}</h3>
						<div className="modal-price text-3xl font-extrabold mb-3">{products['2'].price}</div>
						<p className="modal-desc text-base leading-relaxed text-gray-600 mb-8">{products['2'].description}</p>
						<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
					</div>,
					document.body
				)}

			</div>
		</>
	);
};

export default ProductDetailsPanel;
