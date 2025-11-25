import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductModal = ({ productData, videoUrl, onClose }) => {
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showProgressHandle, setShowProgressHandle] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const verticalSwiperRef = useRef(null);
  const horizontalSwiperRefs = useRef({});
  const videoRef = useRef(null);
  const progressContainerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Detecta se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Pequeno delay para garantir que o DOM está pronto antes de animar
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    if (videoRef.current && currentVideoTime > 0) {
      videoRef.current.currentTime = currentVideoTime;
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
    
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
      document.body.style.overflow = '';
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !progressContainerRef.current) return;
    
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!clientX) return;
    
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    if (videoRef.current.duration) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!productData?.id) {
      console.error('ID do produto não encontrado');
      alert('Erro: ID do produto não encontrado');
      return;
    }

    // Constrói a URL de adicionar ao carrinho
    let addToCartUrl = productData.add_to_cart_url;
    
    // Se não tiver URL, constrói manualmente
    if (!addToCartUrl) {
      addToCartUrl = `${window.location.origin}/?add-to-cart=${productData.id}`;
    }
    
    console.log('Adicionando ao carrinho - URL:', addToCartUrl);
    console.log('ID do produto:', productData.id);

    // Tenta usar jQuery do WooCommerce (método preferido)
    if (typeof jQuery !== 'undefined') {
      // Usa o método do WooCommerce se disponível
      if (typeof wc_add_to_cart_params !== 'undefined') {
        jQuery.ajax({
          type: 'POST',
          url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'add_to_cart'),
          data: {
            product_id: productData.id,
            product_sku: productData.sku || '',
          },
          success: function(response) {
            if (response.error && response.product_url) {
              window.location = response.product_url;
              return;
            }
            // Sucesso
            jQuery('body').trigger('wc_fragment_refresh');
            jQuery('body').trigger('added_to_cart', [response.fragments, response.cart_hash, jQuery(event.target)]);
            alert('Produto adicionado ao carrinho!');
          },
          error: function() {
            // Fallback para método GET
            window.location.href = addToCartUrl;
          }
        });
      } else {
        // Fallback: usa GET tradicional
        jQuery.ajax({
          type: 'GET',
          url: addToCartUrl,
          dataType: 'html',
          success: function(response) {
            console.log('Produto adicionado com sucesso via GET');
            jQuery('body').trigger('wc_fragment_refresh');
            jQuery('body').trigger('added_to_cart', [false, false, false]);
            alert('Produto adicionado ao carrinho!');
          },
          error: function(xhr, status, error) {
            console.error('Erro ao adicionar ao carrinho:', error, xhr);
            // Fallback: redireciona para a página do produto
            if (productData?.permalink) {
              window.location.href = productData.permalink;
            } else {
              window.location.href = addToCartUrl;
            }
          }
        });
      }
    } else {
      // Fallback: redireciona diretamente para a URL
      console.log('jQuery não disponível, redirecionando para:', addToCartUrl);
      window.location.href = addToCartUrl;
    }
  };

  const images = productData?.images || [];
  
  // Debug: verifica se os dados estão chegando
  useEffect(() => {
    console.log('ProductModal - Dados do produto:', productData);
    console.log('ProductModal - Imagens:', images);
    console.log('ProductModal - Título:', productData?.title);
    console.log('ProductModal - Preço:', productData?.formatted_price || productData?.price);
  }, [productData, images]);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-0 backdrop-blur-sm overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      <button
        className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-14 md:h-14 bg-white/18 text-white border-none rounded-full text-2xl md:text-3xl font-bold cursor-pointer backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110 hover:rotate-90 z-50"
        onClick={onClose}
      >
        ×
      </button>

      <div 
        className={`w-full h-full ${isMobile ? '' : 'md:flex md:flex-row md:justify-center md:items-center md:gap-0 md:h-[683px] md:max-h-[90vh] md:w-[784px] md:max-w-[95vw] md:absolute md:top-1/2 md:left-1/2'}`}
        style={{
          transform: isVisible 
            ? (isMobile ? 'scale(1)' : 'translate(-50%, -50%) scale(1)')
            : (isMobile ? 'scale(0.95)' : 'translate(-50%, -50%) scale(0.95)'),
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swiper Vertical */}
        <Swiper
          ref={verticalSwiperRef}
          direction="vertical"
          slidesPerView={1}
          spaceBetween={0}
          modules={[Mousewheel, Keyboard]}
          mousewheel={true}
          keyboard={{ enabled: true }}
          className="w-full h-full md:w-[384px] md:max-w-[50vw] md:rounded-l-[16px] md:shadow-2xl md:shadow-black/70 overflow-hidden"
        >
          <SwiperSlide className="w-full h-full relative">
            {/* Swiper Horizontal para este reel */}
            <Swiper
              ref={(el) => {
                if (el) horizontalSwiperRefs.current[0] = el;
              }}
              slidesPerView={1}
              spaceBetween={0}
              modules={[Pagination, Keyboard]}
              pagination={{ clickable: true }}
              keyboard={{ enabled: true }}
              className="w-full h-full relative"
            >
              {/* Slide de Vídeo */}
              <SwiperSlide className="relative">
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                  />
                  
                  {/* Overlay de Play/Pause */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={togglePlayPause}
                  />
                  
                  {/* Barra de Progresso */}
                  <div
                    ref={progressContainerRef}
                    className="absolute bottom-9 left-5 right-5 h-[10px] bg-transparent z-30 cursor-pointer pt-[3.5px]"
                    onClick={handleProgressClick}
                    onMouseDown={() => setShowProgressHandle(true)}
                    onTouchStart={() => setShowProgressHandle(true)}
                    onMouseUp={() => setShowProgressHandle(false)}
                    onTouchEnd={(e) => {
                      handleProgressClick(e);
                      setShowProgressHandle(false);
                    }}
                  >
                    <div className="evo-reels-progress-line">
                      <div
                        className="evo-reels-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="evo-reels-progress-handle"
                        style={{
                          left: `${progress}%`,
                          opacity: showProgressHandle ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>

              {/* Slides de Imagens */}
              {images && images.length > 0 ? (
                images.map((image, index) => {
                  if (!image) return null;
                  return (
                    <SwiperSlide key={`image-${index}`} className="slide-zoom cursor-crosshair relative">
                      <img
                        src={image}
                        alt={`${productData?.title || 'Produto'} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', image);
                          e.target.style.display = 'none';
                        }}
                      />
                    </SwiperSlide>
                  );
                })
              ) : (
                <SwiperSlide className="slide-zoom cursor-crosshair relative">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                    <p>Nenhuma imagem disponível</p>
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Controles Superiores */}
            <div className="absolute top-4 right-4 flex gap-3 z-30">
              <button
                className="control-btn w-11 h-11 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl cursor-pointer border-none"
                onClick={toggleSound}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>

            {/* Footer Mobile */}
            <div
              className="pointer-events-auto cursor-pointer z-20 md:hidden absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
              onClick={(e) => {
                e.stopPropagation();
                // Abre modal de detalhes no mobile
                const mobileModal = document.getElementById('evo-reels-mobile-modal');
                if (mobileModal) {
                  mobileModal.style.bottom = '0';
                }
              }}
            >
              <div className="profile flex items-center gap-2 mb-1">
                {images[0] && (
                  <img 
                    src={images[0]} 
                    alt={productData?.title || 'Produto'}
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                )}
                {!images[0] && (
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-400" />
                )}
                <div>
                  <div className="product-name font-bold text-base text-white">
                    {productData?.title || 'Produto'}
                  </div>
                  <div className="product-price text-sm font-semibold">
                    {productData?.on_sale && productData?.formatted_regular_price ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-green-400">
                          {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
                        </span>
                        <span className="text-gray-400 line-through text-xs">
                          {productData.formatted_regular_price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-green-400">
                        {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="desc text-sm leading-snug opacity-90 mt-1 text-white">
                {productData?.short_description || productData?.description?.substring(0, 100) || ''}
              </div>
            </div>

            {/* Ações Laterais */}
            <div className="actions absolute right-4 bottom-28 flex flex-col gap-6 pointer-events-auto z-20">
              <div>
                <button 
                  onClick={handleAddToCart}
                  className="btn buy bg-white text-black font-bold text-xs rounded-lg w-16 h-12 flex items-center justify-center border-none cursor-pointer hover:bg-gray-100 transition"
                >
                  COMPRAR
                </button>
              </div>
              <div>
                <button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">
                  ❤️
                </button>
                <div className="count text-xs text-center mt-1 text-white">0</div>
              </div>
              <div>
                <button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">
                  💬
                </button>
                <div className="count text-xs text-center mt-1 text-white">0</div>
              </div>
              <div>
                <button className="btn bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-full flex items-center justify-center text-xl">
                  🔗
                </button>
                <div className="count text-xs text-center mt-1 text-white">0</div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Painel de Detalhes Desktop */}
        <div className="hidden md:block md:w-[400px] md:h-[683px] md:max-h-[90vh] bg-white p-8 overflow-y-auto rounded-r-[16px] shadow-2xl text-black flex-shrink-0">
          <h2 className="text-3xl font-bold mb-4">{productData?.title || 'Produto'}</h2>
          
          {/* Preços */}
          <div className="mb-6">
            {productData?.on_sale && productData?.formatted_regular_price ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-4xl font-extrabold text-green-600">
                  {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
                </div>
                <div className="text-2xl font-bold text-gray-400 line-through">
                  {productData.formatted_regular_price}
                </div>
              </div>
            ) : (
              <div className="text-4xl font-extrabold text-green-600">
                {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
              </div>
            )}
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
            {productData?.description || productData?.short_description || ''}
          </p>

          <button 
            onClick={handleAddToCart}
            className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-full text-lg hover:bg-indigo-700 transition mb-6 text-center cursor-pointer"
          >
            ADICIONAR AO CARRINHO
          </button>

          <div className="flex flex-col gap-4 text-sm text-gray-700 border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">🛒</span>
              <span>{productData?.stock_text || 'Verificar disponibilidade'}</span>
            </div>
            {productData?.sku && (
              <div className="flex items-center gap-2">
                <span className="text-indigo-500">🏷️</span>
                <span>SKU: {productData.sku}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Mobile de Detalhes */}
      <div 
        id="evo-reels-mobile-modal"
        className="fixed left-0 w-full h-[90vh] bg-white rounded-t-[32px] p-5 transition-all duration-400 ease-in-out shadow-xl z-[10001] overflow-y-auto"
        style={{ bottom: '-100%' }}
      >
        <div className="flex justify-between items-center pb-2">
          <button 
            className="back-btn bg-none border-none text-xl cursor-pointer p-2 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              const mobileModal = document.getElementById('evo-reels-mobile-modal');
              if (mobileModal) {
                mobileModal.style.bottom = '-100%';
              }
            }}
          >
            ✕
          </button>
        </div>
        <div className="drag-bar w-10 h-1.5 bg-gray-300 rounded-md mx-auto my-2"></div>
        
        {images[0] && (
          <img 
            src={images[0]} 
            className="modal-img w-full h-[340px] object-cover rounded-xl mb-4" 
            alt={productData?.title || 'Produto'}
          />
        )}
        
        <h3 className="modal-title text-2xl font-bold mb-2">{productData?.title || 'Produto'}</h3>
        
        {/* Preços Mobile */}
        <div className="mb-3">
          {productData?.on_sale && productData?.formatted_regular_price ? (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-3xl font-extrabold text-green-600">
                {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
              </div>
              <div className="text-xl font-bold text-gray-400 line-through">
                {productData.formatted_regular_price}
              </div>
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-green-600">
              {productData?.formatted_price || (productData?.price ? `R$ ${parseFloat(productData.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00')}
            </div>
          )}
        </div>
        
        <p className="modal-desc text-base leading-relaxed text-gray-600 mb-8 whitespace-pre-line">
          {productData?.description || productData?.short_description || ''}
        </p>
        
        <button 
          onClick={(e) => {
            handleAddToCart(e);
            // Fecha o modal mobile após adicionar
            setTimeout(() => {
              const mobileModal = document.getElementById('evo-reels-mobile-modal');
              if (mobileModal) {
                mobileModal.style.bottom = '-100%';
              }
            }, 500);
          }}
          className="block buy-btn bg-black text-white border-none py-4 rounded-full text-lg font-bold w-full cursor-pointer text-center"
        >
          COMPRAR AGORA
        </button>
        
        <div className="flex flex-col gap-4 text-sm text-gray-700 border-t pt-4 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-indigo-500">🛒</span>
            <span>{productData?.stock_text || 'Verificar disponibilidade'}</span>
          </div>
          {productData?.sku && (
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">🏷️</span>
              <span>SKU: {productData.sku}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

