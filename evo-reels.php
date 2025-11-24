<?php
/**
 * Plugin Name: EVO Reels
 * Description: Estrutura inicial do plugin EVO Reels para testes de front-end e dashboards.
 * Version: 0.1.0
 * Author: Dev
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'EVO_REELS_PATH', plugin_dir_path( __FILE__ ) );
define( 'EVO_REELS_URL', plugin_dir_url( __FILE__ ) );

// Includes
require_once EVO_REELS_PATH . 'includes/class-evo-reels-admin.php';
require_once EVO_REELS_PATH . 'includes/class-evo-reels-frontend.php';
require_once EVO_REELS_PATH . 'includes/class-evo-reels-cpt.php';
require_once EVO_REELS_PATH . 'includes/class-evo-reels-meta.php';
require_once EVO_REELS_PATH . 'includes/class-evo-reels-db.php';

// Init classes
function evo_reels_init() {
    // Admin
    if ( is_admin() ) {
        new Evo_Reels_Admin();
    }

    // Frontend
    new Evo_Reels_Frontend();

    // Other classes (stubs)
    new Evo_Reels_CPT();
    new Evo_Reels_Meta();
    new Evo_Reels_DB();
}
add_action( 'plugins_loaded', 'evo_reels_init' );
