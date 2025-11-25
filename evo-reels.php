<?php
/**
 * Plugin Name: EVO Reels
 * Plugin URI: https://example.com/evo-reels
 * Description: Plugin React para exibir reels de produtos com miniplayer circular e modal de detalhes. Integração com WooCommerce.
 * Version: 1.0.0
 * Author: Seu Nome
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: evo-reels
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('EVO_REELS_VERSION', '1.0.0');
define('EVO_REELS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EVO_REELS_PLUGIN_URL', plugin_dir_url(__FILE__));

class Evo_Reels {
    
    public function __construct() {
        add_action('plugins_loaded', array($this, 'init'));
    }
    
    public function init() {
        // Verifica se WooCommerce está ativo
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        // Hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        
        // Meta box para produtos
        add_action('add_meta_boxes', array($this, 'add_product_meta_box'));
        add_action('save_post', array($this, 'save_product_video'));
        
        // REST API
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Shortcode
        add_shortcode('evo_reels', array($this, 'render_shortcode'));
        
        // Adiciona container automaticamente em páginas de produto
        add_action('wp_footer', array($this, 'add_product_page_container'));
    }
    
    public function woocommerce_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p><?php _e('EVO Reels requer WooCommerce para funcionar.', 'evo-reels'); ?></p>
        </div>
        <?php
    }
    
    public function enqueue_scripts() {
        // Enfileira apenas se o shortcode estiver presente ou se estiver em uma página de produto
        global $post;
        $should_enqueue = false;
        
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'evo_reels')) {
            $should_enqueue = true;
        }
        
        // Também enfileira em páginas de produto do WooCommerce
        if (function_exists('is_product') && is_product()) {
            $product_id = get_the_ID();
            $video_url = get_post_meta($product_id, '_evo_reels_video', true);
            if ($video_url) {
                $should_enqueue = true;
            }
        }
        
        if ($should_enqueue) {
            wp_enqueue_script(
                'evo-reels',
                EVO_REELS_PLUGIN_URL . 'dist/evo-reels.js',
                array(),
                EVO_REELS_VERSION,
                true
            );
            wp_enqueue_style(
                'evo-reels',
                EVO_REELS_PLUGIN_URL . 'dist/evo-reels.css',
                array(),
                EVO_REELS_VERSION
            );
            
            // Localiza script
            wp_localize_script('evo-reels', 'evoReelsData', array(
                'restUrl' => rest_url('wc/v3/products/'),
                'nonce' => wp_create_nonce('wp_rest'),
            ));
        }
    }
    
    public function admin_enqueue_scripts($hook) {
        if ('post.php' !== $hook && 'post-new.php' !== $hook) {
            return;
        }
        
        global $post;
        if ($post && 'product' === $post->post_type) {
            wp_enqueue_media();
            wp_enqueue_script(
                'evo-reels-admin',
                EVO_REELS_PLUGIN_URL . 'assets/admin.js',
                array('jquery'),
                EVO_REELS_VERSION,
                true
            );
        }
    }
    
    public function add_product_meta_box() {
        add_meta_box(
            'evo_reels_video',
            __('Vídeo Reels', 'evo-reels'),
            array($this, 'render_video_meta_box'),
            'product',
            'side',
            'default'
        );
    }
    
    public function render_video_meta_box($post) {
        wp_nonce_field('evo_reels_save_video', 'evo_reels_video_nonce');
        
        $video_url = get_post_meta($post->ID, '_evo_reels_video', true);
        ?>
        <div class="evo-reels-video-upload">
            <label for="evo_reels_video_url">
                <strong><?php _e('URL do Vídeo:', 'evo-reels'); ?></strong>
            </label>
            <input 
                type="url" 
                id="evo_reels_video_url" 
                name="evo_reels_video_url" 
                value="<?php echo esc_attr($video_url); ?>" 
                class="widefat"
                placeholder="https://exemplo.com/video.mp4"
            />
            <p class="description">
                <?php _e('Cole a URL do vídeo ou use o botão abaixo para fazer upload.', 'evo-reels'); ?>
            </p>
            <button 
                type="button" 
                class="button evo-reels-upload-button"
                data-target="evo_reels_video_url"
            >
                <?php _e('Fazer Upload', 'evo-reels'); ?>
            </button>
            <?php if ($video_url): ?>
                <div class="evo-reels-video-preview" style="margin-top: 10px;">
                    <video 
                        src="<?php echo esc_url($video_url); ?>" 
                        controls 
                        style="max-width: 100%; height: auto;"
                    ></video>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    public function save_product_video($post_id) {
        // Verifica nonce
        if (!isset($_POST['evo_reels_video_nonce']) || 
            !wp_verify_nonce($_POST['evo_reels_video_nonce'], 'evo_reels_save_video')) {
            return;
        }
        
        // Verifica permissões
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Salva o vídeo
        if (isset($_POST['evo_reels_video_url'])) {
            $video_url = esc_url_raw($_POST['evo_reels_video_url']);
            update_post_meta($post_id, '_evo_reels_video', $video_url);
        } else {
            delete_post_meta($post_id, '_evo_reels_video');
        }
    }
    
    public function register_rest_routes() {
        register_rest_field('product', 'evo_reels_video', array(
            'get_callback' => function($object) {
                return get_post_meta($object['id'], '_evo_reels_video', true);
            },
            'update_callback' => null,
            'schema' => array(
                'type' => 'string',
                'context' => array('view', 'edit'),
            ),
        ));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'product_id' => get_the_ID(),
        ), $atts);
        
        $product_id = intval($atts['product_id']);
        $video_url = get_post_meta($product_id, '_evo_reels_video', true);
        
        if (!$video_url) {
            return '';
        }
        
        // Busca dados do produto
        $product = wc_get_product($product_id);
        if (!$product) {
            return '';
        }
        
        // Formata preço
        $price = $product->get_price();
        $formatted_price = wc_price($price);
        
        // Status de estoque
        $stock_status = $product->get_stock_status();
        $stock_text = '';
        if ($stock_status === 'instock') {
            $stock_text = $product->get_stock_quantity() ? 
                sprintf(__('Em estoque (%d unidades)', 'evo-reels'), $product->get_stock_quantity()) : 
                __('Em estoque', 'evo-reels');
        } elseif ($stock_status === 'outofstock') {
            $stock_text = __('Fora de estoque', 'evo-reels');
        } elseif ($stock_status === 'onbackorder') {
            $stock_text = __('Sob encomenda', 'evo-reels');
        }
        
        $product_data = array(
            'id' => $product->get_id(),
            'title' => $product->get_name(),
            'price' => $price,
            'formatted_price' => strip_tags($formatted_price),
            'description' => wp_strip_all_tags($product->get_description()),
            'short_description' => wp_strip_all_tags($product->get_short_description()),
            'stock_status' => $stock_status,
            'stock_text' => $stock_text,
            'sku' => $product->get_sku(),
            'permalink' => get_permalink($product->get_id()),
            'images' => array(),
        );
        
        // Adiciona a imagem principal primeiro
        if ($product->get_image_id()) {
            $main_image = wp_get_attachment_image_url($product->get_image_id(), 'full');
            if ($main_image) {
                $product_data['images'][] = $main_image;
            }
        }
        
        // Adiciona imagens da galeria
        $image_ids = $product->get_gallery_image_ids();
        foreach ($image_ids as $image_id) {
            $image_url = wp_get_attachment_image_url($image_id, 'full');
            if ($image_url && !in_array($image_url, $product_data['images'])) {
                $product_data['images'][] = $image_url;
            }
        }
        
        // Debug: verifica dados antes de enviar
        error_log('EVO Reels - Dados do produto (PHP): ' . print_r($product_data, true));
        
        // Renderiza o container React
        ob_start();
        ?>
        <div id="evo-reels-root" 
             data-product-id="<?php echo esc_attr($product_id); ?>"
             data-video-url="<?php echo esc_url($video_url); ?>"
             data-product-data="<?php echo esc_attr(wp_json_encode($product_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)); ?>">
        </div>
        <script>
            window.evoReelsData = window.evoReelsData || {};
            window.evoReelsData.productId = <?php echo intval($product_id); ?>;
            window.evoReelsData.videoUrl = <?php echo wp_json_encode($video_url, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;
            window.evoReelsData.productData = <?php echo wp_json_encode($product_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;
            console.log('EVO Reels - Dados do PHP:', window.evoReelsData);
        </script>
        <?php
        return ob_get_clean();
    }
    
    // Adiciona o container automaticamente em páginas de produto
    public function add_product_page_container() {
        if (function_exists('is_product') && is_product()) {
            $product_id = get_the_ID();
            $video_url = get_post_meta($product_id, '_evo_reels_video', true);
            
            if ($video_url) {
                $product = wc_get_product($product_id);
                if ($product) {
                    // Formata preço
                    $price = $product->get_price();
                    $formatted_price = wc_price($price);
                    
                    // Status de estoque
                    $stock_status = $product->get_stock_status();
                    $stock_text = '';
                    if ($stock_status === 'instock') {
                        $stock_text = $product->get_stock_quantity() ? 
                            sprintf(__('Em estoque (%d unidades)', 'evo-reels'), $product->get_stock_quantity()) : 
                            __('Em estoque', 'evo-reels');
                    } elseif ($stock_status === 'outofstock') {
                        $stock_text = __('Fora de estoque', 'evo-reels');
                    } elseif ($stock_status === 'onbackorder') {
                        $stock_text = __('Sob encomenda', 'evo-reels');
                    }
                    
                    $product_data = array(
                        'id' => $product->get_id(),
                        'title' => $product->get_name(),
                        'price' => $price,
                        'formatted_price' => strip_tags($formatted_price),
                        'description' => wp_strip_all_tags($product->get_description()),
                        'short_description' => wp_strip_all_tags($product->get_short_description()),
                        'stock_status' => $stock_status,
                        'stock_text' => $stock_text,
                        'sku' => $product->get_sku(),
                        'permalink' => get_permalink($product->get_id()),
                        'images' => array(),
                    );
                    
                    // Adiciona a imagem principal primeiro
                    if ($product->get_image_id()) {
                        $main_image = wp_get_attachment_image_url($product->get_image_id(), 'full');
                        if ($main_image) {
                            $product_data['images'][] = $main_image;
                        }
                    }
                    
                    // Adiciona imagens da galeria
                    $image_ids = $product->get_gallery_image_ids();
                    foreach ($image_ids as $image_id) {
                        $image_url = wp_get_attachment_image_url($image_id, 'full');
                        if ($image_url && !in_array($image_url, $product_data['images'])) {
                            $product_data['images'][] = $image_url;
                        }
                    }
                    
                    echo '<div id="evo-reels-root" 
                         data-product-id="' . esc_attr($product_id) . '"
                         data-video-url="' . esc_url($video_url) . '"
                         data-product-data="' . esc_attr(wp_json_encode($product_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) . '">
                         </div>';
                    echo '<script>
                        window.evoReelsData = window.evoReelsData || {};
                        window.evoReelsData.productId = ' . intval($product_id) . ';
                        window.evoReelsData.videoUrl = ' . wp_json_encode($video_url, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';
                        window.evoReelsData.productData = ' . wp_json_encode($product_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';
                        console.log("EVO Reels - Dados do PHP (footer):", window.evoReelsData);
                    </script>';
                }
            }
        }
    }
}

// Inicializa o plugin
new Evo_Reels();
