import { useState, useRef, useEffect } from 'react';

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
    left: position.x !== null ? `${position.x}px` : 'auto',
    top: position.y !== null ? `${position.y}px` : 'auto',
    right: position.x !== null ? 'auto' : '24px',
    bottom: position.y !== null ? 'auto' : '24px',
  };

  return (
    <div
      ref={playerRef}
      className="evo-circle-player fixed w-[100px] h-[100px] z-[9999] cursor-grab rounded-full overflow-hidden shadow-2xl border-4 border-transparent transition-all duration-300 hover:scale-110"
      style={{
        ...style,
        background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #ff00c3, #ff6bff, #00f2ff, #00ff9d, #ff00c3) border-box',
      }}
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
        className="w-full h-full object-cover rounded-full"
      />
      <button
        className="evo-circle-close absolute top-1 right-1 w-[26px] h-[26px] bg-black/75 text-white border-none rounded-full font-bold text-sm cursor-pointer flex items-center justify-center backdrop-blur-sm shadow-lg hover:bg-red-600/90 hover:scale-110 transition-all z-10"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Miniplayer;

