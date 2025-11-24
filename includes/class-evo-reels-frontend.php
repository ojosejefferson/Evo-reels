<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Evo_Reels_Frontend {

    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
    }

    public function enqueue_frontend_assets() {
        // Swiper CSS
        wp_enqueue_style( 'evo-swiper-css', 'https://unpkg.com/swiper/swiper-bundle.min.css', array(), null );

        // Tailwind (CDN)
        wp_enqueue_script( 'evo-tailwind-cdn-frontend', 'https://cdn.tailwindcss.com', array(), null );

        // Swiper JS
        wp_enqueue_script( 'evo-swiper-js', 'https://unpkg.com/swiper/swiper-bundle.min.js', array(), null, true );
    }

}
