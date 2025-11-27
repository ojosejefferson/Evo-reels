<?php
/**
 * Plugin Name: Evo Reels
 * Plugin URI: https://example.com/evo-reels
 * Description: Floating mini video player for posts, pages, and WooCommerce products with React-based frontend.
 * Version: 1.0.0
 * Author: Evo Reels Team
 * Author URI: https://example.com
 * Text Domain: evo-reels
 * Domain Path: /languages
 * Requires at least: 6.6
 * Requires PHP: 8.2
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package EvoReels
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'EVO_REELS_VERSION', '1.0.0' );
define( 'EVO_REELS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EVO_REELS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'EVO_REELS_PLUGIN_FILE', __FILE__ );
define( 'EVO_REELS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class.
 */
class Evo_Reels {

	/**
	 * Plugin instance.
	 *
	 * @var Evo_Reels
	 */
	private static $instance = null;

	/**
	 * Admin instance.
	 *
	 * @var Evo_Reels_Admin
	 */
	public $admin;

	/**
	 * Frontend instance.
	 *
	 * @var Evo_Reels_Frontend
	 */
	public $frontend;

	/**
	 * Get plugin instance.
	 *
	 * @return Evo_Reels
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->load_dependencies();
		$this->init_hooks();
	}

	/**
	 * Load plugin dependencies.
	 */
	private function load_dependencies() {
		require_once EVO_REELS_PLUGIN_DIR . 'includes/class-admin.php';
		require_once EVO_REELS_PLUGIN_DIR . 'includes/class-frontend.php';
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'plugins_loaded', array( $this, 'init' ) );
		register_activation_hook( __FILE__, array( $this, 'activate' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize plugin.
	 */
	public function init() {
		// Load text domain.
		load_plugin_textdomain( 'evo-reels', false, dirname( EVO_REELS_PLUGIN_BASENAME ) . '/languages' );

		// Initialize admin.
		if ( is_admin() ) {
			$this->admin = new Evo_Reels_Admin();
		}

		// Initialize frontend.
		if ( ! is_admin() ) {
			$this->frontend = new Evo_Reels_Frontend();
		}
	}

	/**
	 * Plugin activation.
	 */
	public function activate() {
		// Set default settings.
		$default_settings = array(
			'enabled'   => true,
			'shape'     => 'circle',
			'position'  => 'right',
		);

		if ( ! get_option( 'evo_reels_settings' ) ) {
			add_option( 'evo_reels_settings', $default_settings );
		}
	}

	/**
	 * Plugin deactivation.
	 */
	public function deactivate() {
		// Cleanup if needed.
	}
}

/**
 * Initialize the plugin.
 *
 * @return Evo_Reels
 */
function evo_reels() {
	return Evo_Reels::get_instance();
}

// Start the plugin.
evo_reels();
