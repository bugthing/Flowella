/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *--------------------------------------------------------------------------*/

/*- CONTROLLERS ------------------------------------------------------------*/

FApp.toolsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/build/tools', function() {})
        .success(function(json) {
            // clear out the list..
            FApp.toolsController.set("content", [] );
            // add content back in one by one..
            for (var i=0; i < json.length; i++) {
                FApp.toolsController.pushObject(
                    FApp.ToolModel.create({
                        ref: json[i].ref,
                        name: json[i].name,
                    })
                );
            }
        })
        .error(function() { alert('error getting tools'); });
    },
    applyToolToSection: function(toolRef) {

        // do some sort of "is there an active section edit" test
        var sec = FApp.sectionController.get('section');
        if ( typeof( sec ) === 'undefined' ) {
            alert('No active section, cant add tool');
            return;
        }
        // add to active sectionline to section (with only a tool ref)
        FApp.sectionController.newSectionLine( toolRef );
    }
});

FApp.chartsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/read/charts', function(){})
        .success(function(json) {
            // clear out the list..
            FApp.chartsController.set("content", [] );
            // add content into this array object one by one..
            for (var i=0; i < json.length; i++) {
                FApp.chartsController.pushObject( 
                    FApp.ChartModel.create({
                        id: json[i].id,
                        name: json[i].name,
                    })
                );
            }
        })
        .error(function() { alert('error getting charts'); });
    },
    adjustedIndex: function(){
        alert( this.getPath('_parentView.contentIndex') );
    }.property(),
});

FApp.chartSectionsController = Ember.ArrayController.create({
});
FApp.chartEdgesController = Ember.ArrayController.create({
});

FApp.chartController = Ember.Object.create({
    chart: Ember.required(),
    loadVisualArea: function() {
        this.get('chart').getREST().success( function(){

            var chart = FApp.chartController.get('chart');

            // build array of section objects..
            var sections = new Array();
            for( var i=0; i < chart.sections.length; i++ ) {
                sections.push(
                    FApp.SectionModel.create({
                        id: chart.sections[i].id,
                        name: chart.sections[i].name,
                        pos_left: chart.sections[i].pos_left,
                        pos_top: chart.sections[i].pos_top
                    })
                );
            }
            FApp.chartSectionsController.set('content', sections );

            // build array of edge objects..
            var edges = new Array();
            for( var i=0; i < chart.edges.length; i++ ) {
                edges.push(
                    Ember.Object.create({
                        fromSectionId: chart.edges[i][0],
                        toSectionId: chart.edges[i][1],
                        label: chart.edges[i][2].label
                    })
                );
            }
            FApp.chartEdgesController.set('content', edges);

            // show view?
            if ( typeof(FApp.chartContainerView) == 'undefined' ) {
                FApp.chartView = FApp.ChartView.create();
                FApp.chartView.replaceIn('#mainarea');
            }

        });
    }.observes('chart'),

    title: function() {
        return this.get('chart').name;
    }.property('chart'),
    sections: function() {
        return this.get('chart').sections;
    }.property('chart'),
    edges: function() {
        return this.get('chart').edges;
    }.property('chart'),


    showSectionEditor: function ( sectionID ) {

        // find the section from the loaded list and set it
        FApp.chartSectionsController.get('content').forEach(function(sec) {
            if ( sec.id === sectionID ) {
                FApp.sectionController.set('section', sec );
            }
        });
    },
    addNewSection: function ( baseSecID ) {
        var chartId = this.get('chart').id;
        var newSection = FApp.SectionModel.create({ 'chart_id': chartId });
        newSection.postREST().success( function() {
            FApp.sectionController.set('section', newSection);
            FApp.chartSectionsController.pushObject(newSection);
        });
    },
    delSection: function( sectionId ) {
        var sec = FApp.SectionModel.create({ 'id': sectionId });
        sec.delREST().success( function() {
            // should delete from this.sections AND FApp.chartSectionsController!
            FApp.chartController.loadVisualArea();
        });
    },
    addOnwardSection: function( fromSectionID, buttonLabel ) {

        var data = {
            buttons_next_counter: 1,
            buttons_next_label_1: buttonLabel,
            chart_id: this.get('chart').id,
            outward_section_id: fromSectionID,
            tool_ref: 'buttons_next'
        };
        var url = '/rest/build/onward_section';

        return jQuery.ajax({
          'url': url,
          dataType: 'json',
          type: 'POST',
          'data': data
        }).done( function(json) {
            var newSectionID = json.id;
            var newSection = FApp.SectionModel.create({ id: newSectionID });
            newSection.getREST().success( function(){
                FApp.sectionController.set('section', newSection);
                FApp.chartController.loadVisualArea();
            });
        });
    },
    dropSection: function( sectionID, posLeft, posTop ) {
        // build section object.
        var droppedSection = FApp.SectionModel.create({'id': sectionID});
        // set the new left and top possition..
        droppedSection.set('pos_left', posLeft);
        droppedSection.set('pos_top', posTop);

        // this is a massive hack so it only puts the pos_left/top data
        var old_list = droppedSection.get('resourceProperties');
        droppedSection.set('resourceProperties', ['pos_left','pos_top']);
        droppedSection.putREST();
        droppedSection.set('resourceProperties', old_list);
        
    }
});

FApp.sectionController = Ember.Object.create({
    section:  Ember.required(),
    loadEditArea: function() {
        this.get('section').getREST().success( function(){

            // show edit popup
            var view = FApp.SectionEditModalView.create({});
            view.replaceIn('#sectioneditmodalcontainer');

        });
    }.observes('section'),

    updateName: function( name ) {
        var sec = this.get('section');
        sec.set('name', name );
        
        // do rubbish hack so we only send 'name'..
        var rp = sec.resourceProperties;
        sec.resourceProperties = ['name'];

        sec.putREST().success( function() { });
    
        sec.resourceProperties = rp; // put list back to put hack back
    },

    loadSectionLine: function( sectionLineID ) {

        var sl = FApp.SectionlineModel.create({ 'id': sectionLineID });
        sl.getREST().success( function() {
            build_section_line_edit_area( sl );
        });
    },
    newSectionLine: function( toolRef ) {

        var secId = this.get('section').id;
        var sl = FApp.SectionlineModel.create({ 
            'section_id': secId,
            'tool_ref': toolRef 
        });
        sl.postREST().success( function() {
            FApp.sectionController.loadEditArea();
        });
    },
    delSectionLine: function( sectionLineID ) {

        var sl = FApp.SectionlineModel.create({ 'id': sectionLineID });
        sl.delREST().success( function() {
            FApp.sectionController.loadEditArea();
        });
    },
    submitSectionLines: function() {

        var section_line_weight = 0;
        var finalIndex = $('#newformitems').find('.sectionlineedit').length - 1;
        $('#newformitems').find('.sectionlineedit').each( function( index, section_line_div ) {
            var myRegexp = /^edit_html_([0-9]+)$/;
            var match = myRegexp.exec( section_line_div.id );
            var section_line_id = match[1];

            var section_line_form   = $(section_line_div).find('form');
            var section_line_data   = $(section_line_form).serializeArray();

            // add weight to the json ..
            section_line_weight++;
            section_line_data.push({
                name: 'weight',
                value: section_line_weight
            });

            var sl = FApp.SectionlineModel.create({
                'id': section_line_id,
            });
            sl.putFormData( section_line_data ).success( function( data ) {
                if ( data.success == 1 ) {
                    $(section_line_div).attr('class', "alert-message success");
                    $(section_line_div).html( 'saved section_line:' + sl.get('id') );
                } else {
                    $(section_line_div).html( data.edit_html );
                }
            });
        });
    },

});

// ArrayBased controller to hold a list of section lines..
FApp.sectionLinesController = Ember.ArrayController.create({
    buildSectionLineEdits: function() {
        // add edit area to page..;
        FApp.EditSectionView.create({}).replaceIn('#newform');
        // add content to edit area
        this.get('content').forEach(function(secLine) {
            secLine.getREST().success( function(){
                console.log('controller:' + secLine);
                FApp.editSectionLineView = FApp.SectionLineEditView.create({
                    'sectionLine' : secLine
                });
                FApp.editSectionLineView.appendTo('#section_editarea');
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

