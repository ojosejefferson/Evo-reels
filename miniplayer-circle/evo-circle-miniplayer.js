// ==================== EVO-CIRCLE CORE ====================
const EvoCircle = {
    player: document.getElementById('evoCirclePlayer'),
    video: document.getElementById('evoCircleVideo'),
    modal: document.getElementById('evoCircleModal'),
    fullVideo: document.getElementById('evoCircleFullVideo'),
    isDragging: false,
    wasDragging: false,
    offset: { x: 0, y: 0 },

    init() {
        // Tenta iniciar o vídeo no modo muted (necessário para autoplay na maioria dos navegadores)
        if (this.video) this.video.play().catch(() => {});
        this.setupDrag();
        
        // Listener para abrir o modal quando clicar no player (mas não se for arrastar ou clicar no X)
        this.player.addEventListener('click', (e) => {
            if (this.wasDragging) { this.wasDragging = false; return; }
            if (!e.target.classList.contains('evo-circle-close')) {
                this.openModal();
            }
        });
    },

    openModal() {
        this.video.pause();
        this.player.style.opacity = '0'; // Efeito de transição suave
        setTimeout(() => {
            this.player.style.display = 'none';
            this.modal.classList.add('open');
            this.fullVideo.currentTime = this.video.currentTime; // Sincroniza o tempo do vídeo
            this.fullVideo.play();
        }, 300);
    },

    closeModal() {
        this.fullVideo.pause();
        this.modal.classList.remove('open');
        setTimeout(() => {
            this.player.style.display = 'block';
            this.player.style.opacity = '1';
            this.video.currentTime = this.fullVideo.currentTime || 0; // Sincroniza de volta
            this.video.play().catch(() => {});
        }, 400); // Espera a animação do modal fechar
    },

    close() {
        this.player.style.opacity = '0';
        setTimeout(() => this.player.style.display = 'none', 300);
        this.video.pause();
    },

    // Lógica de Drag & Drop (Mouse e Touch)
    setupDrag() {
        const startDrag = (e) => {
            if (e.target.classList.contains('evo-circle-close')) return;
            this.isDragging = true;
            this.player.style.cursor = 'grabbing';
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            this.offset.x = clientX - this.player.getBoundingClientRect().left;
            this.offset.y = clientY - this.player.getBoundingClientRect().top;
            e.preventDefault();
        };

        const moveDrag = (e) => {
            if (!this.isDragging) return;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            this.player.style.left = `${clientX - this.offset.x}px`;
            this.player.style.top = `${clientY - this.offset.y}px`;
            // Redefine right/bottom para que left/top sejam os dominantes
            this.player.style.right = 'auto';
            this.player.style.bottom = 'auto';
            this.wasDragging = true;
            e.preventDefault();
        };

        const endDrag = () => {
            this.isDragging = false;
            this.player.style.cursor = 'grab';
            setTimeout(() => this.wasDragging = false, 100);
        };

        this.player.addEventListener('mousedown', startDrag);
        this.player.addEventListener('touchstart', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
};

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => EvoCircle.init());
window.EvoCircle = EvoCircle;