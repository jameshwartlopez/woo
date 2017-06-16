(function ($) {


    lsVendSyncModal = {
        options: '',
        init: function (options) {
            this.cacheDom();
            this.bindEvents();
            this.setOptions(options);
        },

        setOptions: function (options) {
            this.options = options;
        },

        cacheDom: function () {
            this.$mainContainer = $('#ls-main-wrapper');
            this.$btnVendToWoo = this.$mainContainer.find('.product_sync_to_woo');
            this.$btnWooToVend = this.$mainContainer.find('.product_sync_to_vend');
            this.btnVendToWooSinceLastSync = this.$mainContainer.find('.product_sync_to_woo_since_last_sync');

            this.$modalMessage = this.$mainContainer.find('.sync-modal-message');
            this.$popUpButtons = this.$mainContainer.find('#pop_button');
            this.$closeIcon = this.$mainContainer.find('.close-icon');
            this.$syncProgressContainer = this.$mainContainer.find('#sync_progress_container');
            this.$progressBar = this.$mainContainer.find("#progressbar");
            this.$progressBarLabel = this.$mainContainer.find(".progress-label");
            this.$dasboardLink = this.$mainContainer.find('.ls-dashboard-link');
            this.$syncModalContainer = this.$mainContainer.find('.ls-vend-sync-modal');
            this.$modalContent = this.$mainContainer.find('.ls-vend-sync-modal-content');
            this.$modalBackDrop = this.$mainContainer.find('.ls-modal-backdrop');
            this.$modalClose = this.$mainContainer.find('.ls-modal-close');
            this.$modalCloseContainer = this.$mainContainer.find('.ls-modal-close-container');
            this.$btnShowPopUpForWooToVend = this.$mainContainer.find('.btn-sync-woo-to-vend');
            this.$btnShowPopUpForVendToWoo = this.$mainContainer.find('.btn-sync-vend-to-woo');
            this.$btnShopPopUpForVendToWooSinceLastUpdate = this.$mainContainer.find('.vend_to_woo_since_last_update');
            this.$syncButtonsContainer = this.$mainContainer.find('.sync-buttons');

            this.$syncToWooButtons = this.$mainContainer.find('.sync-to-woo-buttons');
            this.$syncToVendButtons = this.$mainContainer.find('.sync-to-vend-buttons');
            this.$syncToWooButtonsSinceLastSync = this.$mainContainer.find('.sync-to-woo-buttons-since-last-update');

            this.$tabMenu = this.$mainContainer.find('.ls-tab-menu');
        },

        bindEvents: function () {
            this.btnVendToWooSinceLastSync.on('click', function () {
                lsVendSyncModal.hideSyncButtonsAndShowProgress(function () {
                    lsVendSyncModal.setOptions({
                        first_message_label: "Getting products from Vend since last update.",
                        no_products_to_import_woo: "No products were imported to WooCommerce since last sync",
                        action: 'vend_since_last_sync'
                    });
                    lsVendSyncModal.$progressBar.progressbar("value", 0);
                    lsVendSyncModal.$progressBarLabel.html("Sync is starting!");
                    lsVendSyncModal.syncProductsFromVend();
                });
            });

            this.$btnVendToWoo.on('click', function () {
                lsVendSyncModal.hideSyncButtonsAndShowProgress(function () {
                    lsVendSyncModal.setOptions({
                        first_message_label: "Sync is starting!",
                        no_products_to_import_woo: "No products were imported to WooCommerce",
                        action: 'vend_get_products'
                    });
                    lsVendSyncModal.$progressBar.progressbar("value", 0);
                    lsVendSyncModal.$progressBarLabel.html("Sync is starting!");
                    lsVendSyncModal.syncProductsFromVend();
                });
            });

            this.$btnWooToVend.on('click', function () {

                lsVendSyncModal.hideSyncButtonsAndShowProgress(function () {
                    lsVendSyncModal.$progressBar.progressbar("value", 0);
                    lsVendSyncModal.$progressBarLabel.html("Sync is starting!");
                    lsVendSyncModal.syncProductsToVend();
                });
            });

            this.$btnShowPopUpForVendToWoo.on('click', function () {

                lsVendSyncModal.open({
                    buttonGroup: 'vend_to_woo',
                    htmlMessage: 'Your products from Vend will be imported to WooCommerce.<br/>Do you wish to continue?'
                });

            });

            this.$btnShowPopUpForWooToVend.on('click', function () {

                lsVendSyncModal.open({
                    buttonGroup: 'woo_to_vend',
                    htmlMessage: 'Your WooCommerce products will be exported to Vend.<br/>Do you wish to continue?'
                });
            });

            this.$btnShopPopUpForVendToWooSinceLastUpdate.on('click', function () {

                lsVendSyncModal.open({
                    buttonGroup: 'vend_to_woo_since_last_sync',
                    htmlMessage: 'Your products from Vend will be imported to WooCommerce.<br/>Do you wish to continue?'
                });

            });

            this.$modalClose.on('click', function () {
                lsVendSyncModal.close(1);
            });

            this.initializeSyncProgress();

        },

        syncProductToVend: function (woocommerce_products, product_index) {
            if (typeof product_index == 'undefined') {
                product_index = 0;
            } else if (product_index <= 0) {
                //Make sure we always start to index 1
                product_index = 0;
            }
            var product_total_count = woocommerce_products.length;
            if (product_total_count > 0) {

                if (typeof woocommerce_products[product_index] != 'undefined') {

                    var product_number = product_index + 1;
                    var data = {
                        action: 'vend_import_to_vend',
                        p_id: woocommerce_products[product_index].ID,
                        product_number: product_number,
                        total_count: product_total_count,
                    };
                    lsVendSyncModal.$modalCloseContainer.hide();
                    lsAjax.post(data).done(function (product_sync_response) {
                        console.log('Successful AJAX Call! Return Data: =>');
                        console.log(product_sync_response);


                        lsVendSyncModal.$progressBarLabel.html("Exported " + product_sync_response.msg + " to Vend (" + product_sync_response.percentage + "%)");
                        progressVal = lsVendSyncModal.$progressBar.progressbar("value");

                        if (product_sync_response.product_number == product_total_count) {
                            lsVendSyncModal.$progressBar.progressbar("value", 100);
                            lsVendSyncModal.syncCompleted();
                        } else {

                            if (progressVal < product_sync_response.percentage) {
                                lsVendSyncModal.$progressBar.progressbar("value", product_sync_response.percentage);
                            }

                        }

                        var temp_product_index = product_index + 1;
                        lsVendSyncModal.syncProductToVend(woocommerce_products, temp_product_index);

                    }).fail(function (data) {

                        console.log('Failed AJAX Call of syncProductToVend :( Return Data: => ');
                        console.log(data);

                        //If failed, retry to sync with the same product index
                        lsVendSyncModal.syncProductToVend(woocommerce_products, product_index);

                    });

                } else if (typeof woocommerce_products[product_index] == 'undefined') {

                }


            } else {

                //No Woocommerce products to sync
                lsVendSyncModal.$progressBar.progressbar("value", 100);
                lsVendSyncModal.$progressBarLabel.html("No products from WooCommerce to export in Vend");

            }

        },

        syncProductsToVend: function () {


            lsAjax.post({action: 'vend_woo_get_products'}).done(function (woo_products) {

                lsVendSyncModal.$progressBarLabel.html("Getting WooCommerce products to be exported in Vend.");
                console.log(woo_products);

                if (!$.isEmptyObject(woo_products)) {

                    lsVendSyncModal.syncProductToVend(woo_products, 0);

                } else {
                    lsVendSyncModal.$progressBar.progressbar("value", 100);
                    lsVendSyncModal.$progressBarLabel.html("No products from WooCommerce to export in Vend");
                }

            }).fail(function (data) {

                console.log('Failed AJAX Call of syncProductsToVend :( Return Data: => ');
                console.log(data);
                lsVendSyncModal.syncProductToVend();

            });
        },

        syncProductFromVend: function (linksync, product_number) {

            if (typeof product_number == 'undefined') {
                product_number = 0;
            } else if (product_number <= 0) {
                //Make sure we always start to page 1
                product_number = 0;
            }

            json_linksync_products = linksync.products[product_number];
            if (typeof json_linksync_products != 'undefined') {
                console.log('json_linksync_products =>');
                console.log(json_linksync_products);

                var product_count = product_number + 1;
                if (linksync.pagination.page > 1) {
                    product_count = product_count + (50 * (linksync.pagination.page - 1));
                }

                var p_data = {
                    action: 'vend_import_to_woo',
                    page: linksync.pagination.page,
                    product_total_count: linksync.pagination.results,
                    product: json_linksync_products,
                    product_number: product_count,
                    product_result_count: linksync.pagination.results,
                    deleted_product: linksync.pagination.deleted_product
                };

                console.log('post data =>');
                console.log(p_data);
                lsVendSyncModal.$modalCloseContainer.hide();
                lsAjax.post(p_data).done(function (product_sync_response) {

                    console.log('Successful AJAX Call! Return Data: =>');
                    console.log(product_sync_response);

                    lsVendSyncModal.$progressBarLabel.html("Imported " + product_sync_response.msg + " in WooCommerce (" + product_sync_response.percentage + "%)");
                    progressVal = lsVendSyncModal.$progressBar.progressbar("value");

                    if (product_sync_response.product_number == linksync.pagination.results) {
                        lsVendSyncModal.$progressBar.progressbar("value", 100);
                        lsVendSyncModal.syncCompleted();
                    } else {

                        if (progressVal < product_sync_response.percentage) {
                            lsVendSyncModal.$progressBar.progressbar("value", product_sync_response.percentage);
                        }

                    }


                    var product_index = product_number + 1;
                    lsVendSyncModal.syncProductFromVend(linksync, product_index);

                }).fail(function (data) {

                    console.log('Failed AJAX Call of syncProductFromVend :( Return Data: ');
                    console.log(data);
                    //If ajax failed retry with the same product_number
                    lsVendSyncModal.syncProductFromVend(linksync, product_number);
                });

            } else if (typeof json_linksync_products == 'undefined') {
                console.log('No product index page => ' + linksync.pagination.page + ' pages => ' + linksync.pagination.pages);
                var page = linksync.pagination.page + 1;
                if (linksync.pagination.pages >= page) {
                    lsVendSyncModal.syncProductsFromVend(page);
                }

            }


        },

        syncProductsFromVend: function (page) {

            //check if page is undefined then we set it to one
            if (typeof page == 'undefined') {
                page = 1;
            } else if (page <= 0) {
                //Make sure we always start to page 1
                page = 1;
            }

            var action = 'vend_get_products';
            if (lsVendSyncModal.options.action != null) {
                action = lsVendSyncModal.options.action;
            }

            var data_to_request = {
                action: action,
                page: page
            };
            console.log('data_to_request => ');
            console.log(data_to_request);

            lsAjax.post(data_to_request).done(function (linksync_response) {

                lsVendSyncModal.$modalClose.hide();
                lsVendSyncModal.$progressBarLabel.html("Syncing products from Vend to WooCommerce.");
                console.log('Ajax Call Done of syncProductsFromVend :) Returned Data =>');
                console.log(linksync_response);

                var product_count = linksync_response.products.length;
                if (product_count > 0) {

                   lsVendSyncModal.syncProductFromVend(linksync_response, 0);

                } else if (product_count <= 1) {
                    lsVendSyncModal.$progressBar.progressbar("value", 100);
                    lsVendSyncModal.syncCompleted();
                    if (lsVendSyncModal.options.no_products_to_import_woo == null) {
                        lsVendSyncModal.$progressBarLabel.html("No products were imported to WooCommerce");
                    } else {
                        lsVendSyncModal.$progressBarLabel.html(lsVendSyncModal.options.no_products_to_import_woo);
                    }
                }

            }).fail(function (data) {
                console.log('Failed AJAX Call of syncProductsFromVend :( Return Data: ' + data);
                //Failed then retry with the same page
                lsVendSyncModal.syncProductsFromVend(page);
            });
        },

        hideSyncButtonsAndShowProgress: function (callback) {

            lsVendSyncModal.$popUpButtons.hide();
            lsVendSyncModal.$modalMessage.hide();
            lsVendSyncModal.$closeIcon.hide();
            lsVendSyncModal.$syncProgressContainer.show();

            lsVendSyncModal.initializeSyncProgress();
            lsVendSyncModal.$progressBarLabel.html("");
            lsVendSyncModal.$modalBackDrop.removeClass('close').addClass('open');
            lsVendSyncModal.$modalContent.css({
                'z-index': '99999'
            });

            if (typeof callback === "function") {
                callback();
            }
        },

        initializeSyncProgress: function () {

            lsVendSyncModal.$progressBar.progressbar({
                value: true,
                complete: function () {
                    lsVendSyncModal.$dasboardLink.removeClass('hide');
                    lsVendSyncModal.close();
                }
            });
            lsVendSyncModal.$progressBar.progressbar("value", 0);

        },

        syncCompleted: function (delay) {
            if (typeof delay == 'undefined') {
                delay = 4000;
            }
            setTimeout(function () {

                lsVendSyncModal.$tabMenu.before('<div class="notice notice-success  sync-completed" > <p>Sync Completed!</p> </div>');
                lsVendSyncModal.$mainContainer.find('.sync-completed').delay(delay).fadeOut('fast');

            }, delay);

        },

        close: function (delay) {
            if (typeof delay == 'undefined') {
                delay = 4000;
            }
            lsVendSyncModal.$syncModalContainer.delay(delay).fadeOut('fast', function () {
                lsVendSyncModal.$progressBarLabel.html("Sync Completed!");
                lsVendSyncModal.$modalBackDrop.removeClass('open').addClass('close');
                lsVendSyncModal.initializeSyncProgress();
                lsVendSyncModal.$modalMessage.show();
                lsVendSyncModal.$syncProgressContainer.hide();
                lsVendSyncModal.$popUpButtons.show();
                lsVendSyncModal.$modalCloseContainer.hide();
                lsVendSyncModal.$modalContent.fadeOut();
            });
        },

        open: function (option) {

            console.log(option);
            lsVendSyncModal.$modalClose.show();
            lsVendSyncModal.$syncButtonsContainer.hide();
            lsVendSyncModal.$modalCloseContainer.show();
            var message = 'Your products from Vend will be imported to WooCommerce.<br/>Do you wish to continue?';
            if (null != option.htmlMessage) {
                message = option.htmlMessage;
            }

            lsVendSyncModal.$modalMessage.html(message);

            if ('woo_to_vend' == option.buttonGroup) {
                lsVendSyncModal.$syncToVendButtons.show();
            } else if ('vend_to_woo' == option.buttonGroup) {
                lsVendSyncModal.$syncToWooButtons.show();
            } else if ('vend_to_woo_since_last_sync' == option.buttonGroup) {
                lsVendSyncModal.$syncToWooButtonsSinceLastSync.show();
            }

            lsVendSyncModal.$syncModalContainer.fadeIn();
            lsVendSyncModal.$modalContent.fadeIn();
        }
    };

})(jQuery);