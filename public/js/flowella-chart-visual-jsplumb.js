
function build_chart_plumbing() {

    var chart = FApp.chartController.get('chart');

    var sections = chart.sections;
    var edges    = chart.edges;

    $('#chartvisual').empty();
    $('#chartvisual').append( '<h2>'+chart.name+'</h2>' );

    // build all the section nodes
    var section_divs = "";
    $.each(sections, function(index, this_section) {
        draw_section_node( 
            this_section.id, 
            this_section.name,  
            {
                left: this_section.pos_left,
                top: this_section.pos_top
            }
        );
    });
    
    // space the section nodes out according to the chart visuial and
    // how they were saved.
    var chart_offset = $('#chartvisual').offset();
    var sec_top  = chart_offset.top;
    var sec_left = chart_offset.left;
    $.each(sections, function(index, this_section) {

        if ( this_section.pos_top == 0 && this_section.pos_left == 0 ) {
            // probably a new section without any possition, try to place sensibly..
            sec_top  = sec_top  + 70;
            sec_left = sec_left + 50;
        }
        else {
            sec_top  = chart_offset.top  + this_section.pos_top;
            sec_left = chart_offset.left + this_section.pos_left;
        }


        $('#section_' + this_section.id).offset(
            { left: sec_left, top: sec_top }
        );
    });
    
    jsPlumb.Defaults.Connector = [ "Flowchart" ];
    jsPlumb.makeTarget(
        'chartvisual', 
        {
            isTarget: true,
            dropOptions:{ 
                tolerance:"touch",
                drop: function(e, ui) {
                    drop_endpoint( ui.draggable, $(this) );
                }
            }
        }
    );


    // this is the paint style for the connecting lines..
    var connectorPaintStyle = { lineWidth:3, strokeStyle: "#346789" };

    // connect the nodes up
    ///$.each(edges, function(index, edge) {
    for( var i=0; i < edges.length; i++ ) {

        var edge = edges[i];

        var overlays = [
            [ "Arrow", { location:0.5 } ], 
            [ "Label", { location:0.8, label: edge[2].label, cssClass: "edge-label" }
            ] 
        ];

        if ( ! $('#section_' + edge[0]).length ) continue;
        if ( ! $('#section_' + edge[1]).length ) continue;

        var source_ep = jsPlumb.addEndpoint( 
            'section_' + edge[0],
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
            'section_' + edge[1],
            {
                anchor:[ "TopCenter" ],
                endpointsOnTop: true,
                maxConnections: -1,
                isSource: false,
                isTarget: true,
                dropOptions:{ 
                    tolerance:"touch",
                    drop: function(e, ui) {
                        drop_endpoint( ui.draggable, $(this) );
                    }
                }
            }
        );

        var connection = jsPlumb.connect({ source: source_ep, target: target_ep, overlays:overlays});
    }
}

function draw_section_node( secID, secName ) {

    var sectionElementID = 'section_' + secID;

    if ( $("#" + sectionElementID).length ){
        $("#" + sectionElementID).empty();
        $("#" + sectionElementID).html( secName );
    }
    else {
        var section_div = '<div id="' + sectionElementID + '" class="sectionnode btn">' + secName + '</div>'
        $('#chartvisual').append(  section_div );
    }
    // make all .window divs draggable
    jsPlumb.draggable(jsPlumb.getSelector(".sectionnode"));
}

function remove_section_node( secID ) {
    jsPlumb.removeAllEndpoints("section_" + secID );
    $("#section_" + secID).remove();
}

