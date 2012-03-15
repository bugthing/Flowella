
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
    buildSectionLineEdits: function() {
        this.get('content').forEach(function(secLine) {
            secLine.getREST().success( function(){
                console.log('controller:' + secLine);
                Flowella.editSectionLineView = Flowella.EditSectionLineView.create({
                    'section_line' : secLine
                });
                Flowella.editSectionLineView.appendTo('#section_editarea');
            });
        });
    }.observes('content'),

    updateSectionLines: function( sectionLinesUpdateData ) {
        this.get('content').forEach(function(secLine) {
            var updateData = sectionLinesUpdateData[ secLine.id ];
            if ( typeof(updateData) !== 'undefined' ) secLine.putFormData( updateData );
        });
        // TODO - update chart/section and give response message 
    }
});

// Non-array controllers

Flowella.chartController = Ember.Object.create({
    chart: Ember.required(),
    title: function() {
        return this.get('chart').name;
    }.property('chart'),

    dropSection: function( sectionID, left, top ) {

        // find section in list..
        var droppedSection;
        Flowella.chartSectionsController.get('content').forEach(function(sec) {
            if ( sectionID == sec.id ) droppedSection = sec;
        });

        // set the new left and top possition..
        droppedSection.set('pos_left', left);
        droppedSection.set('pos_top', top);

        // this is a massive hack so it only puts the pos_left/top data
        var old_list = droppedSection.get('resourceProperties');
        droppedSection.set('resourceProperties', ['pos_left','pos_top']);
        droppedSection.putREST();
        droppedSection.set('resourceProperties', old_list);
    },
    editSection: function( sectionID ) {

        // find the section and get it from server ready for edit..
        var editSection;
        Flowella.chartSectionsController.get('content').forEach(function(sec) {
            if ( sectionID == sec.id ) editSection = sec;
        });

        editSection.getREST().success( function(){
            
            // set THIS controller attribute..
            Flowella.chartSectionController.set('section', editSection);

            // add to SectionLines controller array 
            var sectionLines = new Array();
            for( var i=0; i < editSection.section_lines.length; i++ ) {
                var sl =  Flowella.SectionlineModel.create({
                    id: editSection.section_lines[i].id,
                    tool_ref: editSection.section_lines[i].tool_ref,
                    weight: editSection.section_lines[i].weight
                });
                sectionLines.push(sl);
            }
            Flowella.chartSectionLinesController.set('content', sectionLines);
        
            // show the view..
            if ( typeof(Flowella.sectionLinesView) == 'undefined' ) {
                Flowella.editSectionView = Flowella.EditSectionView.create();
                Flowella.editSectionView.replaceIn('#sidebar');
            }
        });
    },
    delSection: function( sectionID ) {
        // find the section and del it
        var delSection;
        Flowella.chartSectionsController.get('content').forEach(function(sec) {
            if ( sectionID == sec.id ) delSection = sec;
        });
        delSection.delREST().success( function(){ alert('deleted') } );
    },
});

Flowella.chartController.addObserver('chart', function(){
    var chart = this.get('chart');

    // build array of section objects..
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

    // show view?
    if ( typeof(Flowella.chartContainerView) == 'undefined' ) {
        Flowella.chartContainerView = Flowella.ChartContainerView.create();
        Flowella.chartContainerView.replaceIn('#mainarea');
    }

});

Flowella.chartSectionController = Ember.Object.create({
    section: Ember.required(),
});
