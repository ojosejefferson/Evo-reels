<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Evo_Reels_Admin {

    private $pages = array(
        'products' => 'evo-reels-products',
        'ads'     => 'evo-reels-ads',
        'settings'=> 'evo-reels-settings',
    );

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    public function register_menus() {
        // Main menu - the first registered page will be the top-level
        add_menu_page(
            'EVO Reels',
            'EVO Reels',
            'manage_options',
            'evo-reels',
            array( $this, 'render_product_dashboard' ),
            'dashicons-video-alt3'
        );

        // Submenus
        add_submenu_page( 'evo-reels', 'Dashboard Produtos', 'Dashboard Produtos', 'manage_options', $this->pages['products'], array( $this, 'render_product_dashboard' ) );
        add_submenu_page( 'evo-reels', 'Dashboard Ads', 'Dashboard Ads', 'manage_options', $this->pages['ads'], array( $this, 'render_ads_dashboard' ) );
        add_submenu_page( 'evo-reels', 'Ajustes', 'Ajustes', 'manage_options', $this->pages['settings'], array( $this, 'render_settings_page' ) );
    }

    public function enqueue_admin_assets( $hook ) {
        // Only load on our plugin pages
        $current_page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
        $allowed = array_values( $this->pages );
        $allowed[] = 'evo-reels';

        if ( ! in_array( $current_page, $allowed, true ) ) {
            return;
        }

        // Tailwind (CDN)
        wp_enqueue_script( 'evo-tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null );

        // Chart.js
        wp_enqueue_script( 'evo-chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js', array(), '3.7.1', true );

        // Lucide Icons
        wp_enqueue_script( 'evo-lucide', 'https://unpkg.com/lucide@latest', array(), null );
    }

    public function render_product_dashboard() {
        echo '<div class="wrap"><h1>EVO Reels — Dashboard Produtos</h1>';
        $file = EVO_REELS_PATH . 'analytics/analytics-product-dashboard.html';
        if ( file_exists( $file ) ) {
            include $file;
        } else {
            echo '<p>Arquivo de dashboard não encontrado: ' . esc_html( $file ) . '</p>';
        }
        echo '</div>';
    }

    public function render_ads_dashboard() {
        echo '<div class="wrap"><h1>EVO Reels — Dashboard Ads</h1>';
        $file = EVO_REELS_PATH . 'analytics/analytics-ads-dashboard.html';
        if ( file_exists( $file ) ) {
            include $file;
        } else {
            echo '<p>Arquivo de dashboard não encontrado: ' . esc_html( $file ) . '</p>';
        }
        echo '</div>';
    }

    public function render_settings_page() {
        // Modern Tailwind-based settings UI (visual only, no save logic)
        ?>
        <div class="wrap">
            <div class="max-w-4xl mx-auto p-6">
                <h1 class="text-2xl font-bold mb-4">EVO Reels — Ajustes</h1>

                        <form method="post" action="#" class="space-y-6 bg-white p-6 rounded-lg shadow">
                            <div class="grid grid-cols-1 gap-6">
                                <!-- Toggle: WooCommerce -->
                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Ativação</label>
                                        <p class="text-sm text-gray-500">Ativar integração com WooCommerce</p>
                                    </div>
                                    <div>
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="evo_enable_wc" value="1" class="sr-only peer" />
                                            <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300"></div>
                                            <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition"></div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Radio cards: Mini Player Model -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Mini Player: Modelo</label>
                                    <div class="mt-3 grid grid-cols-2 gap-3">
                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_miniplayer_model" value="circle" class="sr-only peer" checked />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">●</div>
                                                    <div>
                                                        <div class="font-medium">Círculo</div>
                                                        <div class="text-sm text-gray-500">Player com bordas arredondadas</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_miniplayer_model" value="rect" class="sr-only peer" />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-12 h-8 bg-gray-100 rounded-sm flex items-center justify-center">▭</div>
                                                    <div>
                                                        <div class="font-medium">Retangular</div>
                                                        <div class="text-sm text-gray-500">Player com formato retangular</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Radio cards: Mini Player Side -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Mini Player: Lado</label>
                                    <div class="mt-3 grid grid-cols-2 gap-3">
                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_miniplayer_side" value="left" class="sr-only peer" checked />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">L</div>
                                                    <div>
                                                        <div class="font-medium">Esquerda</div>
                                                        <div class="text-sm text-gray-500">Mini player posicionado à esquerda</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_miniplayer_side" value="right" class="sr-only peer" />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="flex items-center space-x-3">
                                                    <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">R</div>
                                                    <div>
                                                        <div class="font-medium">Direita</div>
                                                        <div class="text-sm text-gray-500">Mini player posicionado à direita</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Radio cards: Template Post/Page -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Templates: Modelo Post/Página</label>
                                    <div class="mt-3 grid grid-cols-2 gap-3">
                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_template_post" value="default" class="sr-only peer" checked />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="font-medium">Padrão</div>
                                                <div class="text-sm text-gray-500">Layout padrão para posts e páginas</div>
                                            </div>
                                        </label>

                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_template_post" value="carousel" class="sr-only peer" />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="font-medium">Carousel</div>
                                                <div class="text-sm text-gray-500">Template em carrossel</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- Radio cards: Template Products -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Templates: Modelo Produtos</label>
                                    <div class="mt-3 grid grid-cols-2 gap-3">
                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_template_product" value="default" class="sr-only peer" checked />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="font-medium">Padrão</div>
                                                <div class="text-sm text-gray-500">Layout padrão para produtos</div>
                                            </div>
                                        </label>

                                        <label class="cursor-pointer">
                                            <input type="radio" name="evo_template_product" value="grid" class="sr-only peer" />
                                            <div class="p-4 border rounded-lg peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                                                <div class="font-medium">Grid</div>
                                                <div class="text-sm text-gray-500">Layout em grade para produtos</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-end space-x-3">
                                <button type="button" class="bg-gray-100 text-gray-800 px-4 py-2 rounded">Cancelar</button>
                                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded">Salvar (não funcional)</button>
                            </div>
                        </form>
            </div>
        </div>
        <?php
    }

}
