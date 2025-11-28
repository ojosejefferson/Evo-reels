<?php
/**
 * Frontend functionality.
 *
 * @package EvoReels
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Frontend class.
 */
class Evo_Reels_Frontend {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_footer', array( $this, 'render_mini_player' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_filter( 'script_loader_tag', array( $this, 'add_module_attribute' ), 10, 2 );
	}
	
	/**
	 * Add type="module" attribute to Evo Reels scripts.
	 *
	 * @param string $tag    The script tag.
	 * @param string $handle The script handle.
	 * @return string
	 */
	public function add_module_attribute( $tag, $handle ) {
		if ( 'evo-reels-frontend' === $handle || 'evo-reels-client' === $handle ) {
			// Add type="module" if not already present
			if ( false === strpos( $tag, 'type="module"' ) && false === strpos( $tag, "type='module'" ) ) {
				$tag = str_replace( '<script ', '<script type="module" ', $tag );
			}
		}
		return $tag;
	}

	/**
	 * Check if mini player should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_player() {
		// Check if enabled in settings.
		$settings = get_option( 'evo_reels_settings', array() );
		
		// Default to enabled if settings don't exist
		if ( ! isset( $settings['enabled'] ) ) {
			$settings['enabled'] = true;
		}
		
		if ( empty( $settings['enabled'] ) ) {
			return false;
		}

		// Check if we're on a single post/page/product.
		if ( ! is_singular() ) {
			return false;
		}

		// Get video from post meta.
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return false;
		}
		
		$video_url = get_post_meta( $post_id, '_evo_reels_video', true );
		if ( empty( $video_url ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Get player configuration from settings and post meta.
	 *
	 * @return array
	 */
	private function get_player_config() {
		$settings = get_option( 'evo_reels_settings', array() );
		$post_id = get_the_ID();
		$video_url = get_post_meta( $post_id, '_evo_reels_video', true );

		// Get product/post data for modal
		$product_data = array();
		if ( $post_id ) {
			$post = get_post( $post_id );
			$title = get_the_title( $post_id );
			$description = '';
			$price = '';
			$price_formatted = '';

			// Try to get WooCommerce product data
			if ( class_exists( 'WooCommerce' ) && 'product' === get_post_type( $post_id ) ) {
				$product = wc_get_product( $post_id );
				if ( $product ) {
					$title = $product->get_name();
					$description = $product->get_short_description() ?: $product->get_description();
					
					// Get price using WooCommerce function - returns clean formatted price
					$price_raw = $product->get_price();
					if ( $price_raw ) {
						// For sale prices, show sale price and regular price
						if ( $product->is_on_sale() ) {
							$regular_price = $product->get_regular_price();
							$sale_price = $product->get_sale_price();
							if ( $regular_price && $sale_price ) {
								// Format: "R$ 99,90 R$ 149,90" (sale price first, then regular)
								$sale_formatted = html_entity_decode( wp_strip_all_tags( wc_price( $sale_price ) ), ENT_QUOTES, 'UTF-8' );
								$regular_formatted = html_entity_decode( wp_strip_all_tags( wc_price( $regular_price ) ), ENT_QUOTES, 'UTF-8' );
								$price = $sale_formatted . ' ' . $regular_formatted;
							} else {
								// Fallback to current price
								$price = html_entity_decode( wp_strip_all_tags( wc_price( $price_raw ) ), ENT_QUOTES, 'UTF-8' );
							}
						} else {
							// Regular price - use wc_price() to format correctly, then decode HTML entities
							$price = html_entity_decode( wp_strip_all_tags( wc_price( $price_raw ) ), ENT_QUOTES, 'UTF-8' );
						}
					} else {
						// Free product
						$price = __( 'Grátis', 'evo-reels' );
					}
				}
			} else {
				// For posts/pages, get excerpt or content
				$description = get_the_excerpt( $post_id ) ?: wp_trim_words( get_the_content( $post_id ), 30 );
			}

			$product_data = array(
				'1' => array(
					'title'       => $title,
					'price'       => $price, // Clean text version (no HTML)
					'description' => $description,
					'videoUrl'    => esc_url( $video_url ),
				),
			);
		}

		return array(
			'videoUrl'                => esc_url( $video_url ),
			'shape'                  => isset( $settings['shape'] ) ? sanitize_text_field( $settings['shape'] ) : 'circle',
			'position'               => isset( $settings['position'] ) ? sanitize_text_field( $settings['position'] ) : 'right',
			'productModalTemplate'   => isset( $settings['product_modal_template'] ) ? sanitize_text_field( $settings['product_modal_template'] ) : 'split-view',
			'productData'            => $product_data,
		);
	}

	/**
	 * Enqueue frontend scripts.
	 */
	public function enqueue_scripts() {
		// Debug: Log check
		$should_display = $this->should_display_player();
		
		// Only enqueue if player should be displayed.
		if ( ! $should_display ) {
			// Debug mode: uncomment to see why it's not displaying
			// error_log('Evo Reels: Player not displayed. Enabled: ' . (isset($settings['enabled']) ? 'yes' : 'no') . ', Singular: ' . (is_singular() ? 'yes' : 'no') . ', Video URL: ' . ($video_url ?? 'none'));
			return;
		}

		// Get manifest for asset versioning (if using Vite).
		$manifest_path = EVO_REELS_PLUGIN_DIR . 'dist/.vite/manifest.json';
		$manifest = array();

		// Fallback to root manifest if Vite manifest doesn't exist.
		if ( ! file_exists( $manifest_path ) ) {
			$manifest_path = EVO_REELS_PLUGIN_DIR . 'dist/manifest.json';
		}

		if ( file_exists( $manifest_path ) ) {
			$manifest_content = file_get_contents( $manifest_path );
			$manifest = json_decode( $manifest_content, true );
		}

		// Determine asset URLs from manifest or fallback.
		$js_url  = EVO_REELS_PLUGIN_URL . 'dist/assets/main.js';
		$css_url = EVO_REELS_PLUGIN_URL . 'dist/assets/main.css';

		if ( ! empty( $manifest ) ) {
			// Vite manifest format.
			$entry_key = 'src/main.jsx';
			if ( isset( $manifest[ $entry_key ] ) ) {
				$entry = $manifest[ $entry_key ];
				
				if ( ! empty( $entry['file'] ) ) {
					$js_url = EVO_REELS_PLUGIN_URL . 'dist/' . $entry['file'];
				}
				
				if ( ! empty( $entry['css'] ) && is_array( $entry['css'] ) ) {
					$css_url = EVO_REELS_PLUGIN_URL . 'dist/' . $entry['css'][0];
				}
				
				// CRITICAL: Enfileirar CSS dos chunks ANTES do CSS principal (contém Tailwind para os modais)
				// Buscar TODOS os chunks que têm CSS (ProductSplitView contém o Tailwind completo)
				foreach ( $manifest as $key => $asset ) {
					// Buscar chunks que contêm ProductSplitView ou ProductDetailsPanel (com ou sem hash)
					if ( ( strpos( $key, '_ProductSplitView' ) === 0 || strpos( $key, '_ProductDetailsPanel' ) === 0 ) && 
						 isset( $asset['css'] ) && is_array( $asset['css'] ) && ! empty( $asset['css'] ) ) {
						// É um chunk de componente modal com CSS
						foreach ( $asset['css'] as $css_file ) {
							$chunk_css_url = EVO_REELS_PLUGIN_URL . 'dist/' . $css_file;
							$chunk_css_path = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $chunk_css_url );
							if ( file_exists( $chunk_css_path ) ) {
								wp_enqueue_style(
									'evo-reels-tailwind',
									$chunk_css_url,
									array(), // SEM dependências - carrega primeiro
									EVO_REELS_VERSION
								);
								break 2; // Sair dos dois loops após encontrar o primeiro CSS
							}
						}
					}
				}
				
				// Load client chunk JS if it exists in imports
				if ( ! empty( $entry['imports'] ) && is_array( $entry['imports'] ) ) {
					foreach ( $entry['imports'] as $import_key ) {
						$client_key = '_' . $import_key;
						if ( isset( $manifest[ $client_key ] ) && ! empty( $manifest[ $client_key ]['file'] ) ) {
							$client_url = EVO_REELS_PLUGIN_URL . 'dist/' . $manifest[ $client_key ]['file'];
							$client_file_path = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $client_url );
							if ( file_exists( $client_file_path ) ) {
								wp_enqueue_script(
									'evo-reels-client',
									$client_url,
									array(),
									EVO_REELS_VERSION,
									array(
										'strategy'  => 'defer',
										'in_footer' => true,
									)
								);
							}
						}
					}
				}
			}
		}
		
		// Debug: Log URLs
		// error_log('Evo Reels: JS URL: ' . $js_url);
		// error_log('Evo Reels: CSS URL: ' . $css_url);

		// Check if files exist before enqueueing.
		$js_file_path  = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $js_url );
		$css_file_path = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $css_url );

		if ( ! file_exists( $js_file_path ) ) {
			// Files not built yet.
			return;
		}

		// Enqueue CSS if it exists (depois do Tailwind para manter ordem correta)
		if ( file_exists( $css_file_path ) ) {
			wp_enqueue_style(
				'evo-reels-frontend',
				$css_url,
				array( 'evo-reels-tailwind' ), // Dependência do Tailwind (se foi enfileirado)
				EVO_REELS_VERSION
			);
		}

		// Pass configuration to React component first.
		$config = $this->get_player_config();
		
		// Enqueue JS.
		$dependencies = array();
		if ( wp_script_is( 'evo-reels-client', 'registered' ) ) {
			$dependencies[] = 'evo-reels-client';
		}
		
		wp_enqueue_script(
			'evo-reels-frontend',
			$js_url,
			$dependencies,
			EVO_REELS_VERSION,
			array(
				'strategy'  => 'defer',
				'in_footer' => true,
			)
		);

		// Localize script after enqueue.
		wp_localize_script(
			'evo-reels-frontend',
			'evoReelsConfig',
			$config
		);
		
		// Debug: Add inline script to verify config is available
		wp_add_inline_script(
			'evo-reels-frontend',
			'console.log("Evo Reels: Config loaded", window.evoReelsConfig);',
			'after'
		);
	}

	/**
	 * Render mini player root div.
	 */
	public function render_mini_player() {
		if ( ! $this->should_display_player() ) {
			return;
		}

		?>
		<!-- Evo Reels Mini Player -->
		<div id="evo-reels-root" data-evo-reels="enabled"></div>
		<script>
			// Debug: Verify element exists
			console.log('Evo Reels: Root element rendered', document.getElementById('evo-reels-root'));
		</script>
		<?php
	}
}

