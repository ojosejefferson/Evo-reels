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
	}

	/**
	 * Check if mini player should be displayed.
	 *
	 * @return bool
	 */
	private function should_display_player() {
		// Check if enabled in settings.
		$settings = get_option( 'evo_reels_settings', array() );
		if ( empty( $settings['enabled'] ) ) {
			return false;
		}

		// Check if we're on a single post/page/product.
		if ( ! is_singular() ) {
			return false;
		}

		// Get video from post meta.
		$video_url = get_post_meta( get_the_ID(), '_evo_reels_video', true );
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
		$video_url = get_post_meta( get_the_ID(), '_evo_reels_video', true );

		return array(
			'videoUrl'  => esc_url( $video_url ),
			'shape'     => isset( $settings['shape'] ) ? sanitize_text_field( $settings['shape'] ) : 'circle',
			'position'  => isset( $settings['position'] ) ? sanitize_text_field( $settings['position'] ) : 'right',
		);
	}

	/**
	 * Enqueue frontend scripts.
	 */
	public function enqueue_scripts() {
		// Only enqueue if player should be displayed.
		if ( ! $this->should_display_player() ) {
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
			}
		}

		// Check if files exist before enqueueing.
		$js_file_path  = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $js_url );
		$css_file_path = EVO_REELS_PLUGIN_DIR . str_replace( EVO_REELS_PLUGIN_URL, '', $css_url );

		if ( ! file_exists( $js_file_path ) ) {
			// Files not built yet.
			return;
		}

		// Enqueue CSS if it exists.
		if ( file_exists( $css_file_path ) ) {
			wp_enqueue_style(
				'evo-reels-frontend',
				$css_url,
				array(),
				EVO_REELS_VERSION
			);
		}

		// Enqueue JS.

		wp_enqueue_script(
			'evo-reels-frontend',
			$js_url,
			array(),
			EVO_REELS_VERSION,
			array(
				'strategy'  => 'defer',
				'in_footer' => true,
			)
		);

		// Pass configuration to React component.
		$config = $this->get_player_config();
		wp_localize_script(
			'evo-reels-frontend',
			'evoReelsConfig',
			$config
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
		<div id="evo-reels-root"></div>
		<?php
	}
}

