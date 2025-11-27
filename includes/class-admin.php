<?php
/**
 * Admin functionality.
 *
 * @package EvoReels
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin class.
 */
class Evo_Reels_Admin {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'save_post', array( $this, 'save_meta_box' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
	}

	/**
	 * Add settings page.
	 */
	public function add_settings_page() {
		add_options_page(
			__( 'Evo Reels Settings', 'evo-reels' ),
			__( 'Evo Reels', 'evo-reels' ),
			'manage_options',
			'evo-reels',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting(
			'evo_reels_settings_group',
			'evo_reels_settings',
			array(
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => array(
					'enabled'  => true,
					'shape'    => 'circle',
					'position' => 'right',
				),
			)
		);
	}

	/**
	 * Sanitize settings.
	 *
	 * @param array $input Settings input.
	 * @return array
	 */
	public function sanitize_settings( $input ) {
		$sanitized = array();

		$sanitized['enabled'] = isset( $input['enabled'] ) && $input['enabled'] ? true : false;
		$sanitized['shape']   = isset( $input['shape'] ) && in_array( $input['shape'], array( 'circle', 'rectangle' ), true ) ? sanitize_text_field( $input['shape'] ) : 'circle';
		$sanitized['position'] = isset( $input['position'] ) && in_array( $input['position'], array( 'left', 'right' ), true ) ? sanitize_text_field( $input['position'] ) : 'right';

		return $sanitized;
	}

	/**
	 * Render settings page.
	 */
	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$settings = get_option( 'evo_reels_settings', array() );
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( 'evo_reels_settings_group' );
				?>
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="evo_reels_enabled"><?php esc_html_e( 'Enable Mini Player', 'evo-reels' ); ?></label>
							</th>
							<td>
								<input type="checkbox" id="evo_reels_enabled" name="evo_reels_settings[enabled]" value="1" <?php checked( ! empty( $settings['enabled'] ), true ); ?> />
								<p class="description"><?php esc_html_e( 'Enable the floating mini player on posts, pages, and products.', 'evo-reels' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="evo_reels_shape"><?php esc_html_e( 'Player Shape', 'evo-reels' ); ?></label>
							</th>
							<td>
								<select id="evo_reels_shape" name="evo_reels_settings[shape]">
									<option value="circle" <?php selected( isset( $settings['shape'] ) ? $settings['shape'] : 'circle', 'circle' ); ?>><?php esc_html_e( 'Circle', 'evo-reels' ); ?></option>
									<option value="rectangle" <?php selected( isset( $settings['shape'] ) ? $settings['shape'] : 'circle', 'rectangle' ); ?>><?php esc_html_e( 'Rectangle', 'evo-reels' ); ?></option>
								</select>
								<p class="description"><?php esc_html_e( 'Choose the shape of the mini player.', 'evo-reels' ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="evo_reels_position"><?php esc_html_e( 'Player Position', 'evo-reels' ); ?></label>
							</th>
							<td>
								<select id="evo_reels_position" name="evo_reels_settings[position]">
									<option value="left" <?php selected( isset( $settings['position'] ) ? $settings['position'] : 'right', 'left' ); ?>><?php esc_html_e( 'Left', 'evo-reels' ); ?></option>
									<option value="right" <?php selected( isset( $settings['position'] ) ? $settings['position'] : 'right', 'right' ); ?>><?php esc_html_e( 'Right', 'evo-reels' ); ?></option>
								</select>
								<p class="description"><?php esc_html_e( 'Choose the default position of the mini player.', 'evo-reels' ); ?></p>
							</td>
						</tr>
					</tbody>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Add meta box to posts, pages, and products.
	 */
	public function add_meta_box() {
		$post_types = array( 'post', 'page' );

		// Add WooCommerce products if WooCommerce is active.
		if ( class_exists( 'WooCommerce' ) ) {
			$post_types[] = 'product';
		}

		foreach ( $post_types as $post_type ) {
			add_meta_box(
				'evo_reels_video',
				__( 'Evo Reels Video', 'evo-reels' ),
				array( $this, 'render_meta_box' ),
				$post_type,
				'side',
				'default'
			);
		}
	}

	/**
	 * Render meta box.
	 *
	 * @param WP_Post $post Current post object.
	 */
	public function render_meta_box( $post ) {
		wp_nonce_field( 'evo_reels_meta_box', 'evo_reels_meta_box_nonce' );

		$video_url = get_post_meta( $post->ID, '_evo_reels_video', true );
		$video_id  = get_post_meta( $post->ID, '_evo_reels_video_id', true );

		$video_url_display = $video_url ? esc_url( $video_url ) : '';
		$thumbnail_url     = $video_id ? wp_get_attachment_image_url( $video_id, 'thumbnail' ) : '';

		?>
		<div id="evo-reels-meta-box">
			<p>
				<label for="evo_reels_video_url">
					<strong><?php esc_html_e( 'Video URL', 'evo-reels' ); ?></strong>
				</label>
			</p>
			<p>
				<input type="text" id="evo_reels_video_url" name="evo_reels_video_url" value="<?php echo esc_attr( $video_url_display ); ?>" class="widefat" readonly />
			</p>
			<p>
				<button type="button" class="button button-secondary" id="evo-reels-upload-video">
					<?php esc_html_e( 'Upload Video', 'evo-reels' ); ?>
				</button>
				<button type="button" class="button button-secondary" id="evo-reels-remove-video" <?php echo empty( $video_url ) ? 'style="display:none;"' : ''; ?>>
					<?php esc_html_e( 'Remove Video', 'evo-reels' ); ?>
				</button>
			</p>
			<input type="hidden" id="evo_reels_video_id" name="evo_reels_video_id" value="<?php echo esc_attr( $video_id ); ?>" />
			<div id="evo-reels-video-preview" style="<?php echo empty( $thumbnail_url ) ? 'display:none;' : ''; ?> margin-top: 10px;">
				<?php if ( $thumbnail_url ) : ?>
					<img src="<?php echo esc_url( $thumbnail_url ); ?>" alt="" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Save meta box data.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post    Post object.
	 */
	public function save_meta_box( $post_id, $post ) {
		// Check nonce.
		if ( ! isset( $_POST['evo_reels_meta_box_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['evo_reels_meta_box_nonce'] ) ), 'evo_reels_meta_box' ) ) {
			return;
		}

		// Check autosave.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check permissions.
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Save video URL.
		if ( isset( $_POST['evo_reels_video_url'] ) ) {
			$video_url = esc_url_raw( wp_unslash( $_POST['evo_reels_video_url'] ) );
			update_post_meta( $post_id, '_evo_reels_video', $video_url );
		} else {
			delete_post_meta( $post_id, '_evo_reels_video' );
		}

		// Save video ID.
		if ( isset( $_POST['evo_reels_video_id'] ) ) {
			$video_id = absint( $_POST['evo_reels_video_id'] );
			if ( $video_id > 0 ) {
				update_post_meta( $post_id, '_evo_reels_video_id', $video_id );
			} else {
				delete_post_meta( $post_id, '_evo_reels_video_id' );
			}
		} else {
			delete_post_meta( $post_id, '_evo_reels_video_id' );
		}
	}

	/**
	 * Enqueue admin scripts.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_scripts( $hook ) {
		// Only load on post edit pages and settings page.
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php', 'settings_page_evo-reels' ), true ) ) {
			return;
		}

		// Enqueue WordPress media uploader.
		wp_enqueue_media();

		// Enqueue admin script.
		wp_enqueue_script(
			'evo-reels-admin',
			EVO_REELS_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			EVO_REELS_VERSION,
			true
		);
	}
}

