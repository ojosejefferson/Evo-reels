<?php
/**
 * Debug helper for Evo Reels
 * Add this temporarily to debug issues
 */

// Add this to your functions.php or as a mu-plugin to debug
add_action('wp_footer', function() {
	if (current_user_can('manage_options')) {
		$settings = get_option('evo_reels_settings', array());
		$post_id = get_the_ID();
		$video_url = get_post_meta($post_id, '_evo_reels_video', true);
		
		echo '<!-- Evo Reels Debug Info -->';
		echo '<script>';
		echo 'console.log("Evo Reels Debug:");';
		echo 'console.log("Settings:", ' . json_encode($settings) . ');';
		echo 'console.log("Post ID:", ' . ($post_id ?: 'null') . ');';
		echo 'console.log("Video URL:", ' . json_encode($video_url) . ');';
		echo 'console.log("Is Singular:", ' . (is_singular() ? 'true' : 'false') . ');';
		echo 'console.log("Root Element:", document.getElementById("evo-reels-root"));';
		echo 'console.log("Config:", window.evoReelsConfig);';
		echo '</script>';
	}
}, 999);

