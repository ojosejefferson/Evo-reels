<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Evo_Reels_Meta {
    public function __construct() {
        // Placeholder for meta registration/hooks. Keep minimal.
        add_action( 'add_meta_boxes', array( $this, 'register_meta_boxes' ) );
    }

    public function register_meta_boxes() {
        // Example minimal meta box for the CPT
        add_meta_box( 'evo_reel_meta', 'EVO Reel Meta', array( $this, 'render_meta_box' ), 'evo_reel', 'side' );
    }

    public function render_meta_box( $post ) {
        echo '<p>Meta box placeholder for EVO Reels.</p>';
    }
}
