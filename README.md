# Evo Reels - WordPress Plugin

Floating mini video player plugin for WordPress/WooCommerce with React-based frontend. Displays draggable video players on posts, pages, and WooCommerce products.

## Features

- 🎥 Floating mini video player with drag & drop functionality
- ⚙️ Admin settings page to configure player shape and position
- 📦 Meta box for video upload on posts, pages, and WooCommerce products
- ⚛️ Built with React 18 (hooks) and Vite
- 🎨 Tailwind CSS for styling
- 📱 Fully responsive design
- 🔒 Security: Nonces, sanitization, and escaping
- ⚡ Performance: Deferred scripts, lazy loading

## Requirements

- PHP 8.2+
- WordPress 6.6+
- WooCommerce 9.x (optional, for product support)
- Node.js 18+ and npm/yarn (for building)

## Installation

### 1. Install Dependencies

```bash
cd wp-content/plugins/evo-reels
npm install
```

### 2. Build Assets

```bash
npm run build
```

This will create the production build in the `dist/` directory.

### 3. Activate Plugin

Go to WordPress Admin → Plugins and activate "Evo Reels".

## Development

### Development Mode

For development with hot module replacement:

```bash
npm run dev
```

Note: The Vite dev server runs on a different port. For WordPress integration, you'll need to build first (`npm run build`) or configure proxy settings.

### Build for Production

```bash
npm run build
```

This generates optimized, minified files in the `dist/` directory.

## Usage

### 1. Configure Settings

Go to **Settings → Evo Reels** and configure:
- Enable/Disable the mini player
- Player shape (Circle or Rectangle)
- Player position (Left or Right)

### 2. Add Video to Post/Page/Product

1. Edit any post, page, or WooCommerce product
2. Find the "Evo Reels Video" meta box in the sidebar
3. Click "Upload Video" to select an MP4 file from media library
4. Save the post/page/product

### 3. View on Frontend

The mini player will automatically appear on the frontend of pages that have a video uploaded. The player is:
- Draggable (click and drag to move)
- Closable (click the X button)
- Responsive (adjusts size on mobile)

## Plugin Structure

```
evo-reels/
├── assets/
│   └── js/
│       └── admin.js          # Admin meta box functionality
├── includes/
│   ├── class-admin.php       # Admin settings and meta box
│   └── class-frontend.php    # Frontend enqueue and rendering
├── src/
│   ├── components/
│   │   ├── MiniPlayer.jsx    # React component
│   │   └── MiniPlayer.css    # Component styles
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind imports
├── dist/                     # Built assets (generated)
├── evo-reels.php             # Main plugin file
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Customization

### Changing Default Styles

Edit `src/components/MiniPlayer.css` to customize player appearance.

### Modifying React Component

Edit `src/components/MiniPlayer.jsx` to change functionality.

After making changes, rebuild:

```bash
npm run build
```

## Security

- All inputs are sanitized
- Nonces are used for form submissions
- Outputs are escaped
- User capabilities are checked

## Performance

- JavaScript is deferred
- CSS is minified
- Assets are only loaded on pages with videos
- Code splitting via Vite

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE11 is not supported

## License

GPL v2 or later

## Support

For issues and feature requests, please contact the plugin author.
