import { useState, useEffect } from 'react';
import Miniplayer from './components/Miniplayer';
import ProductModal from './components/ProductModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // Função para processar dados do produto
  const processProductData = (data) => {
    if (!data) {
      console.warn('EVO Reels - Dados vazios recebidos');
      return null;
    }
    
    console.log('EVO Reels - Processando dados brutos:', data);
    
    // Garante que os dados estão no formato correto
    const processedData = {
      id: data.id || data.ID || undefined,
      title: data.title || data.name || '',
      price: data.price || '0',
      regular_price: data.regular_price || '',
      sale_price: data.sale_price || '',
      formatted_price: data.formatted_price || (data.price ? 
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parseFloat(data.price)) : 'R$ 0,00'),
      formatted_regular_price: data.formatted_regular_price || '',
      on_sale: data.on_sale || false,
      description: data.description || '',
      short_description: data.short_description || '',
      stock_status: data.stock_status || '',
      stock_text: data.stock_text || '',
      sku: data.sku || '',
      permalink: data.permalink || '#',
      add_to_cart_url: data.add_to_cart_url || '',
      images: Array.isArray(data.images) ? data.images.filter(img => img && img.trim() !== '') : [],
    };
    
    console.log('EVO Reels - Dados processados:', processedData);
    return processedData;
  };

  // Busca dados do produto do WordPress
  useEffect(() => {
    console.log('EVO Reels - Iniciando busca de dados...');
    console.log('EVO Reels - window.evoReelsData:', window.evoReelsData);
    
    const loadData = () => {
      // Tenta obter dados do objeto global primeiro (mais rápido)
      if (window.evoReelsData?.productData) {
        console.log('EVO Reels - Dados encontrados em window.evoReelsData.productData');
        const processed = processProductData(window.evoReelsData.productData);
        if (processed && processed.title) {
          setProductData(processed);
        }
      }

      if (window.evoReelsData?.videoUrl) {
        setVideoUrl(window.evoReelsData.videoUrl);
      }

      // Fallback: busca do elemento data
      const rootElement = document.getElementById('evo-reels-root');
      if (rootElement) {
        const productId = rootElement.getAttribute('data-product-id');
        const videoUrlAttr = rootElement.getAttribute('data-video-url');
        const productDataAttr = rootElement.getAttribute('data-product-data');

        console.log('EVO Reels - Elemento encontrado:', {
          productId,
          videoUrlAttr,
          hasProductData: !!productDataAttr,
          productDataAttrLength: productDataAttr?.length
        });

        if (videoUrlAttr) {
          setVideoUrl(videoUrlAttr);
        }

        if (productDataAttr) {
          try {
            const parsedData = JSON.parse(productDataAttr);
            console.log('EVO Reels - Dados parseados do atributo:', parsedData);
            const processed = processProductData(parsedData);
            if (processed && processed.title) {
              setProductData(processed);
            }
          } catch (e) {
            console.error('Erro ao parsear dados do produto:', e, productDataAttr?.substring(0, 100));
          }
        }

        // Se não tiver dados ainda, tenta buscar via API
        if (productId) {
          // Verifica se já temos dados antes de buscar
          const hasData = window.evoReelsData?.productData?.title || 
                         (productDataAttr && JSON.parse(productDataAttr)?.title);
          if (!hasData) {
            console.log('EVO Reels - Buscando dados via API para produto:', productId);
            fetchProductData(productId);
          }
        }
      } else {
        console.warn('EVO Reels - Elemento evo-reels-root não encontrado');
      }
    };

    // Tenta carregar imediatamente
    loadData();

    // Tenta novamente após um pequeno delay (caso o script ainda não tenha carregado)
    const timeoutId = setTimeout(() => {
      console.log('EVO Reels - Retry: tentando carregar dados novamente');
      loadData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  // Monitora mudanças no window.evoReelsData (caso seja atualizado depois)
  useEffect(() => {
    const checkData = () => {
      if (window.evoReelsData?.productData && (!productData || !productData.title)) {
        console.log('EVO Reels - Dados atualizados detectados');
        const processed = processProductData(window.evoReelsData.productData);
        if (processed && processed.title) {
          setProductData(processed);
        }
      }
      if (window.evoReelsData?.videoUrl && !videoUrl) {
        setVideoUrl(window.evoReelsData.videoUrl);
      }
    };

    // Verifica a cada 100ms por 2 segundos
    const intervalId = setInterval(checkData, 100);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [productData, videoUrl]);

  const fetchProductData = async (productId) => {
    try {
      const apiUrl = window.evoReelsData?.restUrl || '/wp-json/wc/v3/products/';
      console.log('EVO Reels - Buscando produto na API:', `${apiUrl}${productId}`);
      
      const response = await fetch(`${apiUrl}${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const product = await response.json();
      console.log('EVO Reels - Produto recebido da API:', product);
      
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
      
      // Preços
      const regularPrice = product.regular_price || '';
      const salePrice = product.sale_price || '';
      const formattedRegularPrice = regularPrice ? 
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parseFloat(regularPrice)) : '';
      
      const processedData = {
        id: product.id,
        title: product.name,
        price: product.price,
        regular_price: regularPrice,
        sale_price: salePrice,
        formatted_price: formattedPrice,
        formatted_regular_price: formattedRegularPrice,
        on_sale: product.on_sale || false,
        description: product.description || '',
        short_description: product.short_description || '',
        stock_status: product.stock_status,
        stock_text: stockText,
        sku: product.sku || '',
        permalink: product.permalink || '#',
        add_to_cart_url: product.add_to_cart_url || '',
        images: product.images?.map(img => img.src).filter(src => src) || [],
      };
      
      console.log('EVO Reels - Dados processados da API:', processedData);
      setProductData(processedData);
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
        isModalOpen={isModalOpen}
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

