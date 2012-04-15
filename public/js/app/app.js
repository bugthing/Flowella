/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *
 * Requires: jQuery, EmberJS
 *--------------------------------------------------------------------------*/

var FApp = Ember.Application.create({
    ready: function() {
        FApp.toolsController.load();
        FApp.chartsController.load();

        // old skool way of enabling modals.. must replace..
        enable_modals();
    },
});

