import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Miniplayer = ({ videoUrl, onOpenModal, isModalOpen = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragging, setWasDragging] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null });
  const [isVisible, setIsVisible] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Posição inicial (canto inferior direito)
    if (playerRef.current && position.x === null) {
      const rect = playerRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 24,
        y: window.innerHeight - rect.height - 24,
      });
    }

    // Força z-index baixo em TODOS os elementos do WordPress quando miniplayer está visível
    const style = document.createElement('style');
    style.id = 'evo-reels-miniplayer-styles';
    style.textContent = `
      /* Forçar TODOS os elementos do WordPress a ficarem abaixo do miniplayer */
      header,
      footer,
      .site-header,
      .site-footer,
      #header,
      #footer,
      .header,
      .footer,
      .main-header,
      .main-footer,
      nav,
      .navbar,
      .main-navigation,
      .site-navigation,
      .wp-block-group,
      .wp-block-columns,
      .wp-block-template-part,
      .elementor-element,
      .elementor-widget,
      .elementor-section,
      .woocommerce,
      .wc-block-components-notice-banner,
      .wp-block-cover,
      .wp-block-group__inner-container,
      .site-main,
      .content-area,
      .main-content,
      article,
      section,
      div[class*="header"],
      div[class*="footer"],
      div[class*="Header"],
      div[class*="Footer"],
      *[class*="sticky"],
      *[class*="fixed"][class*="top"],
      *[class*="fixed"][class*="bottom"] {
        z-index: 1 !important;
        position: relative !important;
      }
      
      /* Exceção: apenas o miniplayer e modal podem ter z-index alto */
      .evo-circle-player {
        z-index: 2147483647 !important;
        position: fixed !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById('evo-reels-miniplayer-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  // Pausa o vídeo quando o modal abrir
  useEffect(() => {
    if (videoRef.current) {
      if (isModalOpen) {
        videoRef.current.pause();
      } else {
        // Retoma o vídeo quando o modal fechar (se ainda estiver visível)
        if (isVisible) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [isModalOpen, isVisible]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('evo-circle-close')) return;
    
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    setPosition({
      x: clientX - offset.x,
      y: clientY - offset.y,
    });
    setWasDragging(true);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setWasDragging(false), 100);
  };

  const handleClick = (e) => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }
    // Verifica se o clique foi no botão de fechar
    if (e.target.classList.contains('evo-circle-close') || 
        e.target.closest('.evo-circle-close')) {
      return;
    }
    onOpenModal();
  };

  const handleClose = () => {
    setIsVisible(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  if (!isVisible) return null;

  const style = {
    left: position.x !== null ? `${position.x}px` : undefined,
    top: position.y !== null ? `${position.y}px` : undefined,
    right: position.x !== null ? undefined : '24px',
    bottom: position.y !== null ? undefined : '24px',
    zIndex: 2147483647, // Valor máximo do z-index (2^31 - 1)
    position: 'fixed',
    pointerEvents: 'auto',
  };

  const miniplayerContent = (
    <div
      ref={playerRef}
      className="evo-circle-player"
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        muted
      />
      <button
        className="evo-circle-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        ×
      </button>
    </div>
  );

  // Renderiza usando Portal diretamente no body para garantir z-index alto
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(miniplayerContent, document.body);
  }
  return null;
};

export default Miniplayer;

