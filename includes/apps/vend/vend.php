<?php if ( ! defined( 'ABSPATH' ) ) exit('Access is Denied');

/**
 * Check if WooCommerce is active
 */
if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {

	/**
	 * This file will serve as the entry point of vend app
	 */
	class LS_Vend{

		/**
		 * @var LS_Vend instance
		 */
		public static $_instance = null;

		public function __construct() {
			$this->includes();
		}

		/**
		 * LS_Vend get self instance
		 */
		public static function instance(){
			if( is_null( self::$_instance ) ){
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		/**
		 * Vend Includes
		 */
		public static function includes(){
			include_once LS_INC_DIR. 'apps/ls-core-functions.php';
			include_once LS_INC_DIR. 'apps/class-ls-product-meta.php';

			include_once LS_INC_DIR. 'api/ls-api-controller.php';

			require_once LS_INC_DIR.'apps/vend/ls-vend-api-key.php';
			require_once LS_INC_DIR.'apps/vend/ls-vend-log.php';
			require_once LS_INC_DIR.'apps/vend/controllers/ls-log.php';
		}

		/**
		 * Show Vend views
		 */
		public  function view(){
			if (isset($_GET['setting'],$_GET['page']) && $_GET['page'] == 'linksync') {

				if ($_GET['setting'] == 'logs') {

					include_once LS_INC_DIR. 'view/ls-plugins-tab-logs.php';

				}  elseif ($_GET['setting'] == 'product_config') {

					include_once LS_INC_DIR . 'view/vend/ls-plugins-tab-product-config.php';

				} elseif ($_GET['setting'] == 'order_config') {

					require_once LS_INC_DIR. 'view/vend/ls-plugins-tab-order-config.php';

				} else {
					include_once LS_INC_DIR . 'view/ls-plugins-tab-configuration.php';
				}
			} else {
				include_once LS_INC_DIR . 'view/ls-plugins-tab-configuration.php';
			}

		}
	}

	function LS_Vend(){
		return LS_Vend::instance();
	}

	// Global for backwards compatibility.
	$GLOBALS['ls_vend'] = LS_Vend();

}
