// ** DADOS MOCKADOS DOS PRODUTOS **
const productsData = {
    '1': {
        title: "Jaqueta Branca Premium",
        price: "R$ 399,90",
        description: "Tecido premium italiano, acabamento perfeito. Esta jaqueta é a peça chave para qualquer estação, combinando estilo e durabilidade. Edição limitada.",
        stock: "Em estoque, poucas unidades.",
        shipping: "Frete grátis acima de R$299",
        payment: "Parcelamento em até 12x sem juros.",
    },
    '2': {
        title: "Tênis Lifestyle Vermelho",
        price: "R$ 559,99",
        description: "Lançamento da coleção, solado com tecnologia de amortecimento e design moderno. Leve o estilo para onde for! Disponível em vários tamanhos.",
        stock: "Disponível para pré-venda.",
        shipping: "Envio imediato.",
        payment: "Parcelamento em até 6x sem juros.",
    }
};

// ** Variáveis Globais **
const video = document.getElementById('evo-reels-video-1');
const progressFill = document.getElementById('evo-reels-progress-fill-1');
const progressHandle = document.getElementById('evo-reels-progress-handle-1');
const videoOverlay = document.getElementById('evo-reels-video-overlay-1');
const playPauseBtn = document.getElementById('evo-reels-play-pause-btn-1');
const soundBtn = document.getElementById('evo-reels-sound-btn-1');
const videoProgressContainer = document.getElementById('evo-reels-video-progress-1');
const desktopDetailsPanel = document.getElementById('desktop-details-panel');


// ** Função de Renderização do Painel de Detalhes (Desktop) **
function renderDetailsPanel(productId) {
    const product = productsData[productId];
    if (!product || window.innerWidth < 768) return; // Só renderiza no desktop

    document.getElementById('details-title').textContent = product.title;
    document.getElementById('details-price').textContent = product.price;
    document.getElementById('details-description').textContent = product.description;
    document.getElementById('details-stock').textContent = product.stock;
    document.getElementById('details-shipping').textContent = product.shipping;
    document.getElementById('details-payment').textContent = product.payment;
}


// ** Variáveis de Zoom/Touch **
const touchTimestamps = new WeakMap();
const doubleTapDelay = 300; 
let initialPinchDistance = 0;
let currentScale = 1;
let imgElement = null;

// Função auxiliar para calcular a distância entre dois toques (para Pinçar)
function getDistance(touch1, touch2) {
    return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
}

// Função auxiliar para esconder o loading spinner
function hideLoading(id) {
    const indicator = document.getElementById('loading-' + id);
    if (indicator) {
        indicator.classList.add('opacity-0');
        setTimeout(() => indicator.style.display = 'none', 300);
    }
}

// Ocultar spinners de imagem ao carregar
document.querySelectorAll('.slide-zoom img').forEach((img, index) => {
    const loadingId = index + 2; 
    img.addEventListener('load', () => hideLoading(loadingId));
});

// Ocultar spinner do vídeo
if (video) {
    video.addEventListener('canplaythrough', () => hideLoading(1));
}


// ** 1. Configuração do Swiper Vertical (Feed de Reels) **
const verticalSwiper = new Swiper('#evo-reels-vertical-swiper', {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 0,
    mousewheel: true,
    keyboard: { enabled: true },
    on: {
        init: function() {
            // Renderiza o primeiro produto ao iniciar no Desktop
            const initialSlide = this.slides[this.activeIndex];
            const initialProductId = initialSlide.getAttribute('data-product-id');
            renderDetailsPanel(initialProductId);
        },
        slideChangeTransitionStart: function() {
            // Pausa o vídeo anterior (Slide 0) se estiver ativo
            if (this.previousIndex === 0 && video) {
                video.pause();
                videoProgressContainer.style.display = 'none'; 
            }
        },
        slideChangeTransitionEnd: function() {
            const activeSlide = this.slides[this.activeIndex];
            const productId = activeSlide.getAttribute('data-product-id');

            // Renderiza o novo produto no painel Desktop
            renderDetailsPanel(productId);

            // Lógica de Vídeo e Progresso (Apenas Slide 0)
            if (this.activeIndex === 0 && video) {
                video.currentTime = 0;
                video.play().catch(e => console.log("Vídeo não pôde ser reproduzido automaticamente."));
                video.muted = (soundBtn.textContent === "Volume Off");
                videoProgressContainer.style.display = 'block'; 
            } else if (videoProgressContainer) {
                videoProgressContainer.style.display = 'none'; 
            }
            
            const currentHorizontalSwiperElement = activeSlide.querySelector('.evo-reels-horizontal-swiper');
            if (currentHorizontalSwiperElement && currentHorizontalSwiperElement.swiper) {
               currentHorizontalSwiperElement.swiper.slideTo(0);
            }
        },
    }
});

// ** 2. Configuração do Swiper Horizontal (Imagens/Vídeos de um Reel) **
document.querySelectorAll('.evo-reels-horizontal-swiper').forEach(function(element) {
    new Swiper(element, {
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
            el: element.querySelector(".swiper-pagination"),
            clickable: true,
        },
        keyboard: { enabled: true },
        on: {
            slideChange: function() {
                if (verticalSwiper.activeIndex === 0 && video && videoProgressContainer) {
                    if (this.activeIndex === 0) {
                        video.currentTime = 0;
                        video.play();
                        videoProgressContainer.style.opacity = 1;
                    } else {
                        video.pause();
                        videoProgressContainer.style.opacity = 0;
                    }
                }
                
                const prevSlide = this.slides[this.previousIndex];
                if (prevSlide && prevSlide.classList.contains('slide-zoom') && 
                    (prevSlide.classList.contains('touch-zoom-active-fixed') || prevSlide.classList.contains('touch-zoom-active'))) {
                     resetZoom(prevSlide); // Desativa o zoom e reseta a escala
                }
            }
        }
    });
});

// ** 3. Lógica do Vídeo **
if (video) {
    // Configurações iniciais do primeiro vídeo
    video.muted = true;
    video.play().catch(e => console.log("Vídeo não pôde ser reproduzido automaticamente."));

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            progressFill.style.width = percent + '%';
            progressHandle.style.left = percent + '%';
        }
    });
    
    // Função unificada para Seeking (Avançar/Retroceder)
    function handleVideoSeeking(e) {
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        if (!clientX) return;

        const rect = videoProgressContainer.getBoundingClientRect();
        const percent = (clientX - rect.left) / rect.width;
        
        if (video.duration) {
            video.currentTime = percent * video.duration;
        }
    }

    // Eventos de início (touchstart, mousedown) para mostrar o handle
    videoProgressContainer.addEventListener('mousedown', () => progressHandle.style.opacity = 1);
    videoProgressContainer.addEventListener('touchstart', () => progressHandle.style.opacity = 1);

    // Eventos de seek (Click/TouchEnd)
    videoProgressContainer.addEventListener('click', handleVideoSeeking);
    videoProgressContainer.addEventListener('touchend', (e) => {
        handleVideoSeeking(e);
        progressHandle.style.opacity = 0; // Esconde no final do toque
    });
    
    // Eventos de fim (mouseup, touchend) para esconder o handle
    videoProgressContainer.addEventListener('mouseup', () => progressHandle.style.opacity = 0);

    videoOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = 'Play';
        }
        playPauseBtn.classList.add('opacity-100');
        setTimeout(() => playPauseBtn.classList.remove('opacity-100'), 800);
    });
}


// Controle de Som
function toggleSound(id) {
    const targetVideo = document.getElementById('evo-reels-video-' + id);
    const targetBtn = document.getElementById('evo-reels-sound-btn-' + id);
    if (targetVideo) {
        targetVideo.muted = !targetVideo.muted;
        targetBtn.textContent = targetVideo.muted ? "Volume Off" : "Volume On";
    }
}
window.toggleSound = toggleSound;

// ** 4. Lógica do Zoom (Pinçar PRIMÁRIO, Duplo Toque APENAS RESET) **

function resetZoom(parentSlide) {
    const img = parentSlide.querySelector('img');
    
    parentSlide.classList.remove('touch-zoom-active', 'touch-zoom-active-fixed');
    parentSlide.classList.remove('swiper-no-swiping'); 
    
    img.style.transform = 'scale(1)'; 
    img.style.transformOrigin = '';

    parentSlide.removeEventListener('touchmove', handleZoomPan, { passive: false });
    currentScale = 1;
    initialPinchDistance = 0;
    imgElement = null;
}

function handleZoomPan(e) {
    if (e.touches.length !== 1 || !(e.currentTarget.classList.contains('touch-zoom-active') || e.currentTarget.classList.contains('swiper-no-swiping'))) return;

    e.preventDefault(); 
    e.stopPropagation();

    const parentSlide = e.currentTarget;
    const img = parentSlide.querySelector('img');
    const touch = e.touches[0];
    const rect = img.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}


document.querySelectorAll('.slide-zoom').forEach(slide => {
    
    slide.addEventListener('touchstart', (e) => {
        if (window.innerWidth >= 768) return; // Aumentado para 768px (md) para desativar no Desktop

        if (e.touches.length === 2) {
            // ** Pinçar (Pinch-to-Zoom) - PRIMÁRIO **
            e.preventDefault(); 
            
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
            currentScale = 1; 
            imgElement = slide.querySelector('img');

            slide.classList.add('touch-zoom-active', 'swiper-no-swiping');
            
        } else if (e.touches.length === 1) {
            // ** Duplo Toque - APENAS RESET **
            const lastTapTime = touchTimestamps.get(slide) || 0;
            const currentTime = new Date().getTime();

            if (currentTime - lastTapTime < doubleTapDelay) {
                e.preventDefault(); 
                e.stopPropagation(); 
                
                const img = slide.querySelector('img');
                
                const style = window.getComputedStyle(img);
                const matrix = style.transform === 'none' ? [1, 0, 0, 1, 0, 0] : style.transform.match(/matrix.*\((.+)\)/)[1].split(',').map(Number);
                const currentVisualScale = matrix[0];

                if (currentVisualScale > 1.05) { 
                    resetZoom(slide); 
                }
                
                touchTimestamps.set(slide, 0); 
            } else {
                touchTimestamps.set(slide, currentTime);
            }
        }
    }, { passive: false }); 

    slide.addEventListener('touchmove', (e) => {
        if (window.innerWidth >= 768) return;

        if (e.touches.length === 2 && initialPinchDistance > 0) {
            // ** Pinçar (Pinch-to-Zoom) - Movimento **
            e.preventDefault(); 
            e.stopPropagation();

            const newDistance = getDistance(e.touches[0], e.touches[1]);
            let scaleChange = newDistance / initialPinchDistance;
            let newScale = Math.max(1, Math.min(scaleChange, 4)); 

            if (imgElement) {
                imgElement.style.transform = `scale(${newScale})`;
                
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                const rect = imgElement.getBoundingClientRect();
                const x = centerX - rect.left;
                const y = centerY - rect.top;
                const xPercent = (x / rect.width) * 100;
                const yPercent = (y / rect.height) * 100;
                imgElement.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            }
            
            currentScale = newScale;

        } else if (e.touches.length === 1 && (slide.classList.contains('touch-zoom-active') || slide.classList.contains('swiper-no-swiping'))) {
            // Pan (movimento de zoom)
            handleZoomPan(e); 
        }
    }, { passive: false });

    slide.addEventListener('touchend', (e) => {
        if (window.innerWidth >= 768) return;

        // Fim do Pinch
        if (slide.classList.contains('touch-zoom-active')) {
             slide.classList.remove('touch-zoom-active'); 
             slide.removeEventListener('touchmove', handleZoomPan, { passive: false });

             if (currentScale < 1.3) {
                 resetZoom(slide);
             } else {
                 slide.classList.add('swiper-no-swiping'); 
             }
        }
        
        initialPinchDistance = 0;
        imgElement = null;
    });


    // ----------------------------------------------------
    // DESKTOP ZOOM (Hover/Mousemove) - Lupa
    // ----------------------------------------------------
    slide.addEventListener('mousemove', (e) => {
        if (window.innerWidth >= 768) {
            const img = e.currentTarget.querySelector('img');
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        }
    });

    slide.addEventListener('mouseleave', (e) => {
        if (window.innerWidth >= 768) {
             e.currentTarget.querySelector('img').style.transformOrigin = '';
        }
    });
});

// ** 5. Lógica do Modal (MOBILE ONLY) **
function openModal(id) { 
    if (window.innerWidth >= 768) return; // BLOQUEIA ABERTURA NO DESKTOP
    document.getElementById('modal1').classList.remove('bottom-0'); 
    document.getElementById('modal2').classList.remove('bottom-0'); 
    document.getElementById('modal' + id).classList.add('bottom-0'); 
}
function closeModal() { 
    document.getElementById('modal1').classList.remove('bottom-0'); 
    document.getElementById('modal2').classList.remove('bottom-0'); 
}

document.getElementById('modal1').addEventListener('click', e => { 
    // Garante que só feche se clicar no fundo do modal (fora do conteúdo)
    if(e.target === document.getElementById('modal1')) closeModal(); 
});
document.getElementById('modal2').addEventListener('click', e => { 
    // Garante que só feche se clicar no fundo do modal (fora do conteúdo)
    if(e.target === document.getElementById('modal2')) closeModal(); 
});

window.openModal = openModal;
window.closeModal = closeModal;

// Trigger inicial de renderização no Desktop, caso a tela já seja grande
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
         const activeSlide = verticalSwiper.slides[verticalSwiper.activeIndex];
         const productId = activeSlide.getAttribute('data-product-id');
         renderDetailsPanel(productId);
    }
});

// Inicialização (garante que o evento resize também execute se o painel estiver visível ao carregar)
document.addEventListener('DOMContentLoaded', () => {
     if (window.innerWidth >= 768) {
         // Não precisa chamar renderDetailsPanel aqui, pois já é chamado no 'init' do verticalSwiper
     }
});