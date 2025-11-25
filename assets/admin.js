jQuery(document).ready(function($) {
    $('.evo-reels-upload-button').on('click', function(e) {
        e.preventDefault();
        
        const button = $(this);
        const targetInput = $('#' + button.data('target'));
        
        const mediaUploader = wp.media({
            title: 'Selecione ou faça upload do vídeo',
            button: {
                text: 'Usar este vídeo'
            },
            library: {
                type: 'video'
            },
            multiple: false
        });
        
        mediaUploader.on('select', function() {
            const attachment = mediaUploader.state().get('selection').first().toJSON();
            targetInput.val(attachment.url);
            
            // Atualiza preview se existir
            const preview = button.siblings('.evo-reels-video-preview');
            if (preview.length) {
                preview.find('video').attr('src', attachment.url);
            } else {
                button.after(
                    '<div class="evo-reels-video-preview" style="margin-top: 10px;">' +
                    '<video src="' + attachment.url + '" controls style="max-width: 100%; height: auto;"></video>' +
                    '</div>'
                );
            }
        });
        
        mediaUploader.open();
    });
});

