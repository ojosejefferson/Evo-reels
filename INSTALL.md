# Instalação Rápida - Evo Reels

## Passos para Instalação

### 1. Instalar Dependências Node.js

```bash
cd wp-content/plugins/evo-reels
npm install
```

### 2. Construir Assets de Produção

```bash
npm run build
```

Isso criará os arquivos compilados na pasta `dist/`.

### 3. Ativar o Plugin

1. Acesse o WordPress Admin
2. Vá em **Plugins**
3. Ative o plugin **Evo Reels**

### 4. Configurar o Plugin

1. Vá em **Configurações → Evo Reels**
2. Configure:
   - ✅ Habilitar Mini Player
   - Escolha a forma (Círculo ou Retângulo)
   - Escolha a posição (Esquerda ou Direita)
3. Salve as configurações

### 5. Adicionar Vídeo em um Post/Página/Produto

1. Edite qualquer post, página ou produto WooCommerce
2. No painel lateral, encontre a meta box **"Evo Reels Video"**
3. Clique em **"Upload Video"**
4. Selecione um arquivo MP4 da biblioteca de mídia
5. Salve o post/página/produto

### 6. Ver no Frontend

O mini player aparecerá automaticamente na página do frontend que possui um vídeo configurado!

## Desenvolvimento

Para desenvolvimento com hot reload:

```bash
npm run dev
```

**Nota:** O servidor Vite roda em uma porta separada. Para integração com WordPress, você precisará construir primeiro (`npm run build`).

## Estrutura Criada

✅ Arquivo principal do plugin (`evo-reels.php`)
✅ Classe Admin (settings + meta box)
✅ Classe Frontend (enqueue + renderização)
✅ Componente React (`MiniPlayer.jsx`)
✅ CSS convertido do HTML original
✅ JavaScript admin para upload de vídeo
✅ Configurações Vite, Tailwind, PostCSS
✅ README completo

## Funcionalidades Implementadas

✅ Página de configurações
✅ Meta box para upload de vídeo
✅ Player arrastável
✅ Botão de fechar
✅ Autoplay, loop, muted
✅ Suporte a posts, páginas e produtos WooCommerce
✅ Responsivo mobile
✅ Segurança (nonces, sanitização, escape)
✅ Performance (defer, lazy loading)

## Próximos Passos (Fase 2+)

- Modal de vídeo em tela cheia
- Múltiplos vídeos
- Playlists
- Analytics
- Shortcodes

