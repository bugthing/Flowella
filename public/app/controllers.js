
// Controllers

Flowella.toolsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/build/tools', function() {})
        .success(function(json) {
            // clear out the list..
            Flowella.toolsController.set("content", [] );
            // add content back in one by one..
            for (var i=0; i < json.length; i++) {
                Flowella.toolsController.pushObject(
                    Flowella.ToolModel.create({
                        ref: json[i].ref,
                        name: json[i].name
                    })
                );
            }
        })
        .error(function() { alert('error getting tools'); });
    }
});

Flowella.chartsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/read/charts', function(){})
        .success(function(json) {
            // clear out the list..
            Flowella.chartsController.set("content", [] );
            // add content into this array object one by one..
            for (var i=0; i < json.length; i++) {
                Flowella.chartsController.pushObject( 
                    Flowella.ChartModel.create({
                        id: json[i].id,
                        name: json[i].name,
                    })
                );
            }
        })
        .error(function() { alert('error getting charts'); });
    }
});

Flowella.chartSectionsController = Ember.ArrayController.create({
});

Flowella.chartEdgesController = Ember.ArrayController.create({
});

Flowella.chartSectionLinesController = Ember.ArrayController.create({
});

// Non-array controllers

Flowella.chartController = Ember.Object.create({
    chart: Ember.required(),
    title: function() {
        return this.get('chart').name;
    }.property('chart')
});
Flowella.chartController.addObserver('chart', function(){
    var chart = this.get('chart');

    // build array thisof section objects..
    var sections = new Array();
    for( var i=0; i < chart.sections.length; i++ ) {
        sections.push(
            Flowella.SectionModel.create({
                id: chart.sections[i].id,
                name: chart.sections[i].name,
                pos_left: chart.sections[i].pos_left,
                pos_top: chart.sections[i].pos_top
            })
        );
    }
    Flowella.chartSectionsController.set('content', sections );

    // build array of edge objects..
    var edges = new Array();
    for( var i=0; i < chart.edges.length; i++ ) {
        edges.push(
            Flowella.EdgeModel.create({
                fromSectionId: chart.edges[i][0],
                toSectionId: chart.edges[i][1],
                label: chart.edges[i][2].label
            })
        );
    }
    Flowella.chartEdgesController.set('content', edges);

    if ( typeof(Flowella.chartContainerView) == 'undefined' ) {
        Flowella.chartContainerView = Flowella.ChartContainerView.create();
        Flowella.chartContainerView.replaceIn('#mainarea');
    }

});

Flowella.chartSectionController = Ember.Object.create({
    section: Ember.required(),
    editSection: function( id ) {
        var section = Flowella.SectionModel.create({'id': id});
        section.getREST().success( function(){

            Flowella.chartSectionController.set('section', section);

            // build array of sectioneline objects..
            var section_lines = new Array();
            for( var i=0; i < section.section_lines.length; i++ ) {
                var sl =  Flowella.SectionlineModel.create({
                    id: section.section_lines[i].id,
                    tool_ref: section.section_lines[i].tool_ref,
                    weight: section.section_lines[i].weight
                });
                sl.getREST();
                section_lines.push( sl );
            }
        
            Flowella.chartSectionLinesController.set('content', section_lines );
        });
    },
    menuDelete: function() {
        alert('menu DELETE link click and caught in controller');
    }
});
