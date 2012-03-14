
<!-- Flowella - JS Application code -->

var Flowella = Ember.Application.create({
    ready: function() {

        // load the tools
        Flowella.toolsController.load();

        // load the charts..
        Flowella.chartsController.load();

        // create the charts view and add to page.
        Flowella.chartsView = Flowella.ChartsView.create({}).appendTo('#sidebar');

    },
});
