<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Evo_Reels_CPT {
    public function __construct() {
        add_action( 'init', array( $this, 'register_cpt' ) );
    }

    public function register_cpt() {
        // Minimal CPT registration for testing (no complex features)
        $labels = array(
            'name' => 'Reels',
            'singular_name' => 'Reel',
        );

        $args = array(
            'labels' => $labels,
            'public' => true,
            'has_archive' => false,
            'show_in_rest' => true,
            'supports' => array( 'title', 'editor' ),
        );

        register_post_type( 'evo_reel', $args );
    }
}
