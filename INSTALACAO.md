# Guia de Instalação - EVO Reels

## Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- WordPress 5.0+
- WooCommerce 3.0+ instalado e ativo

## Passo a Passo

### 1. Instalar Dependências

No diretório do plugin, execute:

```bash
npm install
```

### 2. Construir o Plugin

Para produção:

```bash
npm run build
```

Isso criará os arquivos em `dist/`:
- `evo-reels.js` (bundle JavaScript)
- `evo-reels.css` (estilos compilados)

### 3. Ativar o Plugin

1. Vá para **Plugins** no admin do WordPress
2. Encontre **EVO Reels**
3. Clique em **Ativar**

### 4. Configurar um Produto

1. Vá para **Produtos > Adicionar Novo** (ou edite um produto existente)
2. No painel lateral direito, você verá a meta box **"Vídeo Reels"**
3. Clique em **"Fazer Upload"** para selecionar um vídeo da biblioteca de mídia
   - OU cole a URL do vídeo diretamente no campo
4. Salve o produto

### 5. Exibir no Frontend

#### Opção 1: Shortcode

Adicione o shortcode em qualquer página ou post:

```
[evo_reels product_id="123"]
```

Ou simplesmente (usa o ID do produto atual):

```
[evo_reels]
```

#### Opção 2: Automático em Páginas de Produto

O plugin automaticamente adiciona o miniplayer em páginas de produto do WooCommerce que tenham vídeo configurado.

## Desenvolvimento

Para desenvolvimento com hot reload:

```bash
npm run dev
```

Isso iniciará o servidor Vite em `http://localhost:5173`

## Estrutura de Arquivos

```
evo-reels/
├── src/                    # Código fonte React
│   ├── components/         # Componentes React
│   │   ├── Miniplayer.jsx
│   │   └── ProductModal.jsx
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Ponto de entrada
│   └── index.css          # Estilos globais
├── assets/                 # Assets do admin
│   └── admin.js           # Script para upload de vídeo
├── dist/                   # Arquivos compilados (gerado)
├── evo-reels.php          # Arquivo principal do plugin
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Funcionalidades

✅ Miniplayer circular arrastável  
✅ Modal fullscreen com Swiper  
✅ Upload de vídeo no admin  
✅ Integração com WooCommerce  
✅ Responsivo (mobile e desktop)  
✅ Controles de vídeo (play/pause, som, progresso)  
✅ Zoom em imagens (pinch no mobile, hover no desktop)  

## Solução de Problemas

### O miniplayer não aparece

1. Verifique se o produto tem um vídeo configurado
2. Verifique se os arquivos em `dist/` foram gerados (`npm run build`)
3. Verifique o console do navegador para erros

### Erro ao fazer build

Certifique-se de que todas as dependências estão instaladas:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vídeo não carrega

- Verifique se a URL do vídeo está correta
- Verifique se o formato do vídeo é suportado (MP4 recomendado)
- Verifique permissões de arquivo no servidor

## Suporte

Para problemas ou dúvidas, consulte a documentação ou abra uma issue.

