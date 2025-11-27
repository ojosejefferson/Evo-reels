import React, { useEffect, useRef } from 'react';
import './ProductSplitView.css';
import { executeProductSplitViewJS } from '../utils/productSplitViewJS';

/**
 * Product Split View Component
 * TikTok Style - Split View with Modal
 */
const ProductSplitView = ({ productsData = {} }) => {
	const containerRef = useRef(null);
	const scriptLoadedRef = useRef(false);

	useEffect(() => {
		// Load Tailwind CSS, Swiper CSS and JS
		const loadDependencies = () => {
			if (scriptLoadedRef.current) return;

			// Load Tailwind CSS (if not already loaded)
			if (!document.querySelector('script[src*="tailwindcss"]')) {
				const tailwindScript = document.createElement('script');
				tailwindScript.src = 'https://cdn.tailwindcss.com';
				document.head.appendChild(tailwindScript);
			}

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

	// Default products data structure
	const defaultProducts = {
		'1': {
			title: "Jaqueta Branca Premium",
			price: "R$ 399,90",
			description: "Tecido premium italiano, acabamento perfeito. Esta jaqueta é a peça chave para qualquer estação, combinando estilo e durabilidade. Edição limitada.",
		},
		'2': {
			title: "Tênis Lifestyle Vermelho",
			price: "R$ 559,99",
			description: "Lançamento da coleção, solado com tecnologia de amortecimento e design moderno. Leve o estilo para onde for! Disponível em vários tamanhos.",
		}
	};

	const products = Object.keys(productsData).length > 0 ? productsData : defaultProducts;

	return (
		<div ref={containerRef} className="evo-reels-product-split-view">
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
								
								<div className="swiper-slide evo-reels-video-slide relative">
									
									<div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300 z-10" id="loading-1">
										<div className="spinner border-4 border-gray-700 border-solid h-10 w-10 rounded-full"></div>
									</div>
									
									<video id="evo-reels-video-1" preload="metadata" loop playsInline muted className="w-full h-full object-cover">
										<source src="https://maksantos.com.br/wp-content/uploads/2024/12/VIDEO-MAKSANTOS-REELS-32-.mp4" type="video/mp4" />
									</video>
									<div className="play-pause-overlay absolute inset-0 z-10 cursor-pointer" id="evo-reels-video-overlay-1"></div>
									<div className="play-pause-btn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl opacity-0 transition-opacity duration-300 pointer-events-none z-10" id="evo-reels-play-pause-btn-1">Pause</div>
								</div>
								
								<div className="swiper-slide slide-zoom cursor-crosshair relative"><img src="https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg" alt="Foto 1" className="w-full h-full object-cover" /></div>
								<div className="swiper-slide slide-zoom cursor-crosshair relative"><img src="https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg" alt="Foto 2" className="w-full h-full object-cover" /></div>
								<div className="swiper-slide slide-zoom cursor-crosshair relative"><img src="https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg" alt="Foto 3" className="w-full h-full object-cover" /></div>
								
							</div>
							<div className="swiper-pagination"></div>
						</div>
						
						<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
							<button className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none" id="evo-reels-sound-btn-1" onClick={() => window.toggleSound && window.toggleSound(1)}>Volume Off</button>
							<button className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none" onClick={() => window.close && window.close()}>X</button>
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
									<img src="https://agweb.co.in/images/portfolio/favicon/apple-icon-60x60.png" alt="Profile" className="w-9 h-9 rounded-full border-2 border-white" />
									<div>
										<div className="product-name font-bold text-base">{products['1']?.title || 'Jaqueta Branca Premium'}</div>
										<div className="product-price text-sm font-semibold text-green-400">{products['1']?.price || 'R$ 399,90'}</div>
									</div>
								</div>
								<div className="desc text-sm leading-snug opacity-90 mt-1">Frete grátis acima de R$299 • Edição limitada • Todo Brasil</div>
							</div>
						</div>
					</div>
					
					<div className="swiper-slide evo-reels-reel-container w-full h-full relative" data-is-video="false">
						<div className="swiper evo-reels-horizontal-swiper w-full h-full relative" id="evo-reels-horizontal-swiper-2">
							<div className="swiper-wrapper">
								
								<div className="swiper-slide slide-zoom cursor-crosshair relative">
									<div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300 z-10" id="loading-2">
										<div className="spinner border-4 border-gray-700 border-solid h-10 w-10 rounded-full"></div>
									</div>
									<img src="https://images.unsplash.com/photo-1542291026-7eec264c27fc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Tênis Vermelho 1" className="w-full h-full object-cover" />
								</div>
								<div className="swiper-slide slide-zoom cursor-crosshair relative">
									<div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300 z-10" id="loading-3">
										<div className="spinner border-4 border-gray-700 border-solid h-10 w-10 rounded-full"></div>
									</div>
									<img src="https://images.unsplash.com/photo-1605342415174-8d4ed0c5c364?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Tênis Vermelho 2" className="w-full h-full object-cover" />
								</div>
								
							</div>
							<div className="swiper-pagination"></div>
						</div>
						
						<div className="top-controls absolute top-4 right-4 flex gap-3 z-30">
							<button className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none" onClick={() => window.close && window.close()}>X</button>
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
										<div className="product-name font-bold text-base">{products['2']?.title || 'Tênis Lifestyle Vermelho'}</div>
										<div className="product-price text-sm font-semibold text-green-400">{products['2']?.price || 'R$ 559,99'}</div>
									</div>
								</div>
								<div className="desc text-sm leading-snug opacity-90 mt-1">Design exclusivo • Lançamento da coleção outono/inverno.</div>
							</div>
						</div>
					</div>
					
				</div>
			</div>
			
			<div className="modal fixed bottom-[-100%] left-1/2 -translate-x-1/2 w-full max-w-[384px] max-h-[90vh] bg-white rounded-t-[32px] p-5 transition-all duration-400 ease-in-out shadow-xl z-[999] overflow-y-auto" id="modal1">
				<div className="flex justify-between items-center pb-2">
					<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={() => window.closeModal && window.closeModal()}>✕</button>
				</div>
				<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
				<img src="https://agweb.co.in/fashion-hub/images/white-top-with-jacket.jpeg" className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Jaqueta" />
				<h3 className="modal-title text-2xl font-bold mb-2">{products['1']?.title || 'Jaqueta Branca Premium'}</h3>
				<div className="modal-price text-3xl font-extrabold mb-3">{products['1']?.price || 'R$ 399,90'}</div>
				<p className="modal-desc text-base leading-relaxed text-gray-600 mb-8">{products['1']?.description || 'Tecido premium italiano, acabamento perfeito. Frete grátis acima de R$299 • Parcelamento em até 12x.'}</p>
				<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
			</div>

			<div className="modal fixed bottom-[-100%] left-1/2 -translate-x-1/2 w-full max-w-[384px] max-h-[90vh] bg-white rounded-t-[32px] p-5 transition-all duration-400 ease-in-out shadow-xl z-[999] overflow-y-auto" id="modal2">
				<div className="flex justify-between items-center pb-2">
					<button className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold" onClick={() => window.closeModal && window.closeModal()}>✕</button>
				</div>
				<div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
				<img src="https://images.unsplash.com/photo-1542291026-7eec264c27fc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" alt="Tênis" />
				<h3 className="modal-title text-2xl font-bold mb-2">{products['2']?.title || 'Tênis Lifestyle Vermelho'}</h3>
				<div className="modal-price text-3xl font-extrabold mb-3">{products['2']?.price || 'R$ 559,99'}</div>
				<p className="modal-desc text-base leading-relaxed text-gray-600 mb-8">{products['2']?.description || 'Lançamento da coleção, solado com tecnologia de amortecimento e design moderno. Leve o estilo para onde for!'}</p>
				<button className="buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer">COMPRAR AGORA</button>
			</div>
		</div>
	);
};

export default ProductSplitView;

