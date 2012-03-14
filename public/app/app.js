
<!-- Flowella - JS Application code -->

var Flowella = Ember.Application.create({

    ready: function() {

        // load the tools
        Flowella.toolsController.load();

        // load the charts..
        Flowella.chartsController.load();

        // create the list charts view and add to page.
        Flowella.chartsView = Flowella.ChartsView.create({});
        Flowella.chartsView.appendTo('#sidebar');

        // create the edit section lines view and add to page.
        Flowella.SectionLinesView = Flowella.SectionLinesView.create({});
        Flowella.SectionLinesView.appendTo('#sidebar');
    },
});
