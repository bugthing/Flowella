
// Views

// Tools - 

Flowella.ToolsView = Ember.View.extend({ 
    templateName: 'list-tools',
    toolsBinding: 'Flowella.toolsController',
});

Flowella.ToolListItemView = Ember.View.extend({
    didInsertElement: function() {
        this.$().draggable({helper: 'clone'});
    },
});

// Charts - 

Flowella.ChartsView = Ember.View.extend({
    templateName: 'list-charts',
    chartsBinding: 'Flowella.chartsController',
});

Flowella.ChartListItemView = Ember.View.extend({
    chart: Ember.required(),
    click: function() {
        // when charts are a list item, is likely they only have name and id,
        // so lets call findResource to make an ajax call to populate it
        var chart = this.get('chart');
        chart.getREST().done(function(){
            Flowella.chartController.set('chart', chart);
        });
    },
});

Flowella.ChartView = Ember.View.extend({
    templateName: 'show-chart',
    chartBinding: 'Flowella.chartController',
});

Flowella.ChartSectionsView = Ember.View.extend({
    templateName: 'list-chartsections',
    sectionsBinding: 'Flowella.chartSectionsController',
});

Flowella.ChartSectionView = Ember.View.extend({
    templateName: 'show-chartsection',
    section: Ember.required(),
    name: function() {
        return this.get('section').name;
    }.property('section'),

    id: function() {
        return 'section_' + this.get('section').id;
    }.property('section'),
    divStyle: function() {
        return 'position:absolute;' 
        + 'left:' + this.get('section').pos_left + 'px;'
        + 'top:'  + this.get('section').pos_top  + 'px;' 
    }.property('section'),
    didInsertElement: function() {

        var controllerID = this.get('section').id;

        // link the section div to context menu..
        this.$().contextMenu(
            'sectionMenu',
            { 
            shadow: true,
            bindings: {
                'edit': function(t) {
                    Flowella.chartSectionController.editSection( controllerID )
                    //var secID = parse_section_id( t.id );
                    //build_section_edit_area( secID );
                },
                'delete': function(t) {
                    controller.menuDelete();
                    //var secID = parse_section_id( t.id );
                    //del_section( secID );
                },
                'onwardsection': function(t) {
                    controller.menuOnwardSection();
                    //var secID = parse_section_id( t.id );
                    //dialog_for_onward_section( secID );
                },
                'newsection': function(t) {
                    controller.menuNewSection();
                    //add_section();
                }
            }
           }
       );
    },
});

Flowella.ChartEdgesView = Ember.View.extend({
    edgesBinding: 'Flowella.chartEdgesController',
    drawCount: 0,
    didInsertElement: function() {
        this.drawEdges();
    },
    reDrawEdges: function(){
        this.rerender();
    }.observes('edges.content'),
    drawEdges: function() {

        var edges = this.get('edges').content;

        jsPlumb.Defaults.Connector = [ "Flowchart" ];
        jsPlumb.makeTarget(
            'chartvisual',
            {
                isTarget: true,
                dropOptions:{
                    tolerance:"touch",
                    drop: function(e, ui) {
                        //drop_endpoint( ui.draggable, $(thisChart) );
                    }
                }
            }
        );

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
                    dropOptions:{
                        tolerance:"touch",
                        drop: function(e, ui) {
                            //drop_endpoint( ui.draggable, $(thisChart) );
                        }
                    }
                }
            );
            var connection = jsPlumb.connect({ source: source_ep, target: target_ep, overlays:overlays});
        };

        // make all .window divs draggable
        jsPlumb.draggable(jsPlumb.getSelector(".sectionnode"));
    },
});

Flowella.ChartSectionMenuView = Ember.View.extend({
    templateName: 'show-chartsectionmenu',
});

Flowella.EditSectionView = Ember.View.extend({
    templateName: 'show-sectionedit',
    section_linesBinding: 'Flowella.chartSectionLinesController',
    sectionBinding: 'Flowella.chartSectionController',
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
            section_line_data.weight = section_line_weight;

            // store the info in an object to pass to controller..
            sectionLinesData[ section_line_id ] = section_line_data;

        });

        // pass edit info to controller..
        this.section_lines.updateSectionLines( sectionLinesData );
    
        // take this view out the DOM
        this.remove();
    }
});

Flowella.EditSectionLineView = Ember.View.extend({
    templateName: 'show-editsectionline',
    section_line: Ember.required(),

    editClass: 'editsectionline',
    editId: function() {
        return 'editsectionline_' + this.get('section_line').id;
    }.property('section_line'),
    editSrc: function() {
        return this.get('section_line').edit_html;
    }.property('section_line'),
});

// Container views..

Flowella.ChartContainerView = Ember.ContainerView.extend({
    childViews: ['toolsView','chartView', 'sectionMenu','sectionsView', 'edgesView'],
    toolsView: Flowella.ToolsView,
    chartView: Flowella.ChartView,
    sectionsView: Flowella.ChartSectionsView,
    edgesView: Flowella.ChartEdgesView,
    sectionMenu: Flowella.ChartSectionMenuView,
});


// HandleBars - section edit helper (crap way of html escaping)

Handlebars.registerHelper('section_line_edit', function(property) {
  var value = Ember.getPath(this, property);
  return new Handlebars.SafeString( value );
});
