/**
 * Admin JavaScript for Evo Reels meta box.
 */
(function($) {
	'use strict';

	$(document).ready(function() {
		// Video uploader.
		var fileFrame;
		var $videoUrlInput = $('#evo_reels_video_url');
		var $videoIdInput = $('#evo_reels_video_id');
		var $previewContainer = $('#evo-reels-video-preview');
		var $removeButton = $('#evo-reels-remove-video');

		// Upload button.
		$('#evo-reels-upload-video').on('click', function(e) {
			e.preventDefault();

			// If the media frame already exists, reopen it.
			if (fileFrame) {
				fileFrame.open();
				return;
			}

			// Create the media frame.
			fileFrame = wp.media({
				title: 'Select Video',
				button: {
					text: 'Use this video'
				},
				library: {
					type: 'video'
				},
				multiple: false
			});

			// When an image is selected, run a callback.
			fileFrame.on('select', function() {
				var attachment = fileFrame.state().get('selection').first().toJSON();

				$videoUrlInput.val(attachment.url);
				$videoIdInput.val(attachment.id);

				// Show thumbnail if available.
				if (attachment.sizes && attachment.sizes.thumbnail) {
					var thumbnailUrl = attachment.sizes.thumbnail.url;
					$previewContainer.html('<img src="' + thumbnailUrl + '" alt="" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />').show();
				} else {
					// Try to get video thumbnail or show placeholder.
					$previewContainer.html('<p style="color: #666;">Video selected: ' + attachment.filename + '</p>').show();
				}

				$removeButton.show();
			});

			// Open the modal.
			fileFrame.open();
		});

		// Remove button.
		$('#evo-reels-remove-video').on('click', function(e) {
			e.preventDefault();
			$videoUrlInput.val('');
			$videoIdInput.val('');
			$previewContainer.hide();
			$removeButton.hide();
		});
	});
})(jQuery);

