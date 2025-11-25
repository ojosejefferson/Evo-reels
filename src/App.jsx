import { useState, useEffect } from 'react';
import Miniplayer from './components/Miniplayer';
import ProductModal from './components/ProductModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // Busca dados do produto do WordPress
  useEffect(() => {
    // Tenta obter dados do objeto global primeiro (mais rápido)
    if (window.evoReelsData?.productData && window.evoReelsData?.videoUrl) {
      console.log('EVO Reels - Dados do produto:', window.evoReelsData.productData);
      setProductData(window.evoReelsData.productData);
      setVideoUrl(window.evoReelsData.videoUrl);
      return;
    }

    // Fallback: busca do elemento data
    const rootElement = document.getElementById('evo-reels-root');
    if (rootElement) {
      const productId = rootElement.getAttribute('data-product-id');
      const videoUrlAttr = rootElement.getAttribute('data-video-url');
      const productDataAttr = rootElement.getAttribute('data-product-data');

      if (videoUrlAttr) {
        setVideoUrl(videoUrlAttr);
      }

      if (productDataAttr) {
        try {
          const parsedData = JSON.parse(productDataAttr);
          console.log('EVO Reels - Dados parseados:', parsedData);
          setProductData(parsedData);
        } catch (e) {
          console.error('Erro ao parsear dados do produto:', e);
        }
      }

      // Se não tiver dados, tenta buscar via API
      if (!productData && productId) {
        fetchProductData(productId);
      }
    }
  }, []);

  const fetchProductData = async (productId) => {
    try {
      const response = await fetch(
        `${window.evoReelsData?.restUrl || '/wp-json/wc/v3/products/'}${productId}`
      );
      const product = await response.json();
      
      // Formata preço
      const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(parseFloat(product.price || 0));
      
      // Status de estoque
      let stockText = '';
      if (product.stock_status === 'instock') {
        stockText = product.stock_quantity ? 
          `Em estoque (${product.stock_quantity} unidades)` : 
          'Em estoque';
      } else if (product.stock_status === 'outofstock') {
        stockText = 'Fora de estoque';
      } else if (product.stock_status === 'onbackorder') {
        stockText = 'Sob encomenda';
      }
      
      setProductData({
        id: product.id,
        title: product.name,
        price: product.price,
        formatted_price: formattedPrice,
        description: product.description || '',
        short_description: product.short_description || '',
        stock_status: product.stock_status,
        stock_text: stockText,
        sku: product.sku || '',
        permalink: product.permalink || '#',
        images: product.images?.map(img => img.src) || [],
      });
    } catch (error) {
      console.error('Erro ao buscar dados do produto:', error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Não renderiza se não houver vídeo
  if (!videoUrl) {
    return null;
  }

  return (
    <>
      <Miniplayer 
        videoUrl={videoUrl}
        onOpenModal={handleOpenModal}
      />
      {isModalOpen && (
        <ProductModal
          productData={productData}
          videoUrl={videoUrl}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default App;

