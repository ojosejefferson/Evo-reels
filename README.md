# EVO Reels - Plugin React para WooCommerce

Plugin WordPress que exibe reels de produtos com miniplayer circular e modal de detalhes, desenvolvido com React, Tailwind CSS e Swiper.js.

## Características

- 🎬 Miniplayer circular arrastável com vídeo em loop
- 📱 Modal responsivo com Swiper para navegação vertical e horizontal
- 🛍️ Integração completa com WooCommerce
- 📤 Upload de vídeo no postbox de produtos
- ⚡ Construído com React e Vite
- 🎨 Estilizado com Tailwind CSS

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Construa o plugin:
```bash
npm run build
```

3. Ative o plugin no WordPress

## Uso

### No Admin do WooCommerce

1. Vá para **Produtos > Adicionar Novo** (ou editar um produto existente)
2. No painel lateral, você verá a meta box **"Vídeo Reels"**
3. Faça upload ou cole a URL do vídeo
4. Salve o produto

### No Frontend

Use o shortcode em qualquer página ou post:

```
[evo_reels product_id="123"]
```

Ou simplesmente:

```
[evo_reels]
```

(usará o ID do produto atual se estiver em uma página de produto)

## Desenvolvimento

Para desenvolvimento com hot reload:

```bash
npm run dev
```

## Estrutura do Projeto

```
evo-reels/
├── src/
│   ├── components/
│   │   ├── Miniplayer.jsx
│   │   └── ProductModal.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── assets/
│   └── admin.js
├── dist/ (gerado após build)
├── evo-reels.php
├── package.json
└── vite.config.js
```

## Requisitos

- WordPress 5.0+
- WooCommerce 3.0+
- PHP 7.4+
- Node.js 16+ (para desenvolvimento)

## Licença

GPL v2 or later
