/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *--------------------------------------------------------------------------*/

/*- VIEWS ------------------------------------------------------------------*/

/*-- list of charts --------------------------------------------------------*/
FApp.ChartListView = Ember.View.extend({
    chart:  Ember.required(),
    buildUrl: function() { 
        var id = this.get('chart').id;
        return '/builder?chart=' + id; 
    }.property('chart'),
});

/*-- new chart ------------------------------------------------------------*/
FApp.NewChartFormView = Ember.View.extend({
    newchartname: null,
    submitNewChart: function() {
        var chartname = this.get('newchartname');
        var newchart = FApp.ChartModel.create({'name': chartname});
        newchart.postREST().success( function(){
            FApp.chartsController.pushObject(newchart);
        });
    },
});


/*-- Chart Builder -----------------------------------------------------*/

/*--- tools ------------------------------------------------------------*/
FApp.ToolsView = Ember.View.extend({
    templateName: 'list-tools',
});
FApp.ToolsSelectView = Ember.Select.extend({
    contentBinding: 'FApp.toolsController',
    optionLabelPath: 'content.name',
    optionValuePath: 'content.ref',
    selectionBinding: "FApp.toolsController.selectedTool"
});

/*--- section editor ------------------------------------------------------*/
FApp.SectionEditModalView = Ember.View.extend({
    templateName: 'show-sectioneditmodal',
    didInsertElement: function() {
        this.show();
    },
    show: function() {
        // hookup the sectionedit modal
        $( ".modal" ).modal({ keyboard: false, backdrop: false });
        $( ".modal-body" ).html("<div id='newform'>Section lines loading..</div>");
        $( ".modal" ).modal( 'show' );
        // display in the old way (see flowella-section-edit.js)
        build_section_edit_area();
    },
    unshow: function() {
        $( ".modal" ).modal( 'close' );
        this.destroyElement();
    },
    clickSave: function() {
        FApp.sectionController.submitSectionLines();
    },
});

FApp.EditSectionView = Ember.View.extend({
    templateName: 'show-sectionedit',
    section_linesBinding: 'FApp.chartSectionLinesController',
    sectionBinding: 'FApp.chartSectionController',
    saveSectionLines: function() {
       
        // find all forms within the div, serialize and do ajax call
        var sectionLinesData = {};
        var section_line_weight = 0;
        $('#section_editarea').find('.editsectionline').each( function( index, section_line_div ) {   

            var myRegexp = /^editsectionline_([0-9]+)$/;
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
            // DO WE NEED THIS?? section_line_data.weight = section_line_weight;

            // store the info in an object to pass to controller..
            sectionLinesData[ section_line_id ] = section_line_data;

        });

        // pass edit info to controller..
        this.section_lines.updateSectionLines( sectionLinesData );

        // take this view out the DOM
        this.remove();
    },
    didInsertElement: function() {
        //alert('added tools'); 
        //$("#section_editarea").sortable();
        $("#section_editarea").droppable({
            accept: '.charttool',
            drop: function(event, ui) {
                alert('dropped');
                //var tool_ref = ui.draggable.attr('id');
                //section.newSectionLine( tool_ref, whenLoadedFunc );
            }

        });
    },
});
FApp.SectionLineEditView = Ember.View.extend({
    templateName: 'show-editsectionline',
    sectionLine: Ember.required(),
    editClass: 'editsectionline',
    editId: function() {
        return 'editsectionline_' + this.get('sectionLine').id;
    }.property('sectionLine'),
    editSrc: function() {
        return this.get('sectionLine').edit_html;
    }.property('sectionLine'),
});

/*--------------- HandleBars - helper --------------------------------------*/
//                            (crap way of html escaping)

Handlebars.registerHelper('section_line_edit', function(property) {
    var value = Ember.getPath(this, property);
    if ( typeof(value) === 'undefined') value = '';
    return new Handlebars.SafeString( value );
});

// Chart - visual 

FApp.ChartView = Ember.View.extend({
    templateName: 'show-chart',
    chartBinding: 'FApp.chartController.chart',
});

FApp.ChartSectionView = Ember.View.extend({
    section: Ember.required(),
    name: function() {
        return this.get('section').name;
    }.property('section'),
    divStyle: function() {
        return 'position:absolute;'
        + 'left:' + this.get('section').pos_left + 'px;'
        + 'top:'  + this.get('section').pos_top  + 'px;'
    }.property('section'),
    secId: function() {
        return 'section_' + this.get('section').id;
    }.property('section'),
    didInsertElement: function() {
        var selector = '#' + 'section_' + this.get('section').id;
        jsPlumb.draggable(jsPlumb.getSelector(selector), {
            stop: function(e, ui) {
                var dragged = ui.helper;
                if ( ! dragged ) return ;
                var matched = dragged.attr('id').match( /^section_([0-9]+)/ );
                if ( matched.length > 1 ) {
                    var sectionID = matched[1];
                    var pos = dragged.position();
                    FApp.chartController.dropSection( sectionID, pos.left, pos.top );
                }
            }
        });
        // right click menu
        this.linkContextMenu();
    },
    linkContextMenu: function() {

        var sec = this.get('section');
        var secID = sec.get('id');

        // link the section div to context menu..
        this.$().contextMenu( 'sectionMenu', {
            shadow: true,
            bindings: {
                'edit': function(t) {
                     FApp.chartController.showSectionEditor( sec );
                },
                'delete': function(t) {
                    FApp.chartController.delSection( sec );
                },
                'onwardsection': function(t) {
                    //oldway// dialog_for_onward_section( secID );

                    var view = FApp.OnwardSectionModalView.create({
                        fromSectionID: secID,
                    });
                    view.replaceIn('#modalcontainer');

                },
                'newsection': function(t) {
                     FApp.chartController.addNewSection( secID );
                }
            }
        });
    },
});

FApp.ChartEdgesView = Ember.View.extend({
    edgesBinding: 'FApp.chartEdgesController',
    didInsertElement: function() {
        this.drawEdges();
    },
    reDrawEdges: function(){
        this.rerender();
    }.observes('edges.content'),
    drawEdges: function() {
        var edges = this.get('edges').content;

        jsPlumb.Defaults.Connector = [ "Flowchart" ];

        var connectorPaintStyle = { lineWidth:3, strokeStyle: "#346789" };

        if ( typeof(edges) == 'undefined' ) return;

        for( var i=0; i < edges.length; i++ ) {
            var edge = edges[i];

            var overlays = [
                [ "Arrow", { location:0.5 } ],
                [ "Label", { location:0.8, label: edge.label, cssClass: "edge-label" } ]
            ];

            if ( ! jQuery('#section_' + edge.fromSectionId).length ) {
                alert('cannot find:' + edge.fromSectionId + '. Is it in the DOM?');
                break;
            }
            var source_ep = jsPlumb.addEndpoint(
                'section_' + edge.fromSectionId,
                {
                    anchor:[ "BottomCenter" ],
                    endpointsOnTop: true,
                    maxConnections: -1,
                    isSource: true,
                    isTarget: false,
                    connectorStyle: connectorPaintStyle
                }
            );
            var target_ep = jsPlumb.addEndpoint(
                'section_' + edge.toSectionId,
                {
                    anchor:[ "TopCenter" ],
                    endpointsOnTop: true,
                    maxConnections: -1,
                    isSource: false,
                    isTarget: true,
                }
            );
            var connection = jsPlumb.connect({ source: source_ep, target: target_ep, overlays:overlays});
        }

    },
});

// Chart - onwardsection

FApp.OnwardSectionModalView = Ember.View.extend({
    fromSectionID:  Ember.required(),
    templateName: 'show-chartsectiononward',
    didInsertElement: function() {
        $("#onwardsectionmodal").modal('show')
        $("#onwardsection_form")[0].reset();
        $("input:hidden[name=outward_section_id]" ).val( this.fromSectionID );
    },
    clickSave: function() {
        var secID = $( "input:hidden[name=outward_section_id]" ).val();
        var label = $( "input:text[name=button_label]" ).val();
        FApp.chartController.addOnwardSection(secID, label);
        $("#onwardsectionmodal").modal('hide');
    },
});

