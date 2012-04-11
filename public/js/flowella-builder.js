
var f;

function loadFlowella( chart_id ) {

    var readyFunc = function( thisFlowella ){

        // draw the tools
        build_tools_visual( thisFlowella );

        // draw the chart
        chart = thisFlowella.builder.loadChart(chart_id, function(chart) { build_chart_visual( chart ) } );

        // enable modals
        enable_modals( chart );
    };

    f = new Flowella({
        whenReady:  readyFunc,
        loadBuilder: 1
    }); 
}

function build_tools_visual( f ) {

    //var items = [];
    //for( var t in f.builder.tools ) {
    //    var tool = f.builder.tools[t];
    //    items.push(
    //        '<div class="ui-widget-content btn charttool" id="' + tool.ref + '">' + tool.name + '</div>'
    //    );
    //}
    //$('#newtools').html( items.join('') );
    //$(".ui-widget-content").draggable({helper: 'clone'});
};

function build_chart_visual() {

   // draw the whole chart
   build_chart_plumbing();

   // link the section div(s) to context menu..
   $('div.sectionnode').contextMenu('sectionMenu', {
       bindings: {
           'edit': function(t) {
                var secID = parse_section_id( t.id );
                FApp.chartController.showSectionEditor( secID );
           },
           'delete': function(t) {
               var secID = parse_section_id( t.id );
               FApp.chartController.delSection( secID );
           },
           'onwardsection': function(t) {
               var secID = parse_section_id( t.id );
               dialog_for_onward_section( secID );
           },
           'newsection': function(t) {
                var secID = parse_section_id( t.id );
                FApp.chartController.addNewSection( secID );
           }
       }
   });


}

function enable_modals( chart ) {

    // hookup the onwardsection modal
    $( "#onwardsectionmodal" ).modal({ keyboard: true, backdrop: true });
    $( "#onwardsectionmodal" ).modal( 'hide' );
    // .. bind and define the 'save' button function..
    $( "#onwardsection_save" ).unbind('click');
    $( "#onwardsection_save" ).bind('click', function() {
        var secId  = $( "input:hidden[name=outward_section_id]" ).val(); 
        var butLab = $( "input:text[name=button_label]" ).val();
        FApp.chartController.addOnwardSection( secId, butLab );
        $("#onwardsectionmodal").modal('hide');
    });

    // hookup the editsection modal
    $( "#editsectionmodal" ).modal({ keyboard: true, backdrop: true });
    $( "#editsectionmodal" ).modal( 'hide' );
    // .. bind and define the 'save' button function..
    $( "#editsection_save" ).unbind('click');
    $( "#editsection_save" ).bind('click', function() {
        var secId  = $( "input:hidden[name=outward_section_id]" ).val(); 
        var butLab = $( "input:text[name=button_label]" ).val();
        FApp.chartController.addOnwardSection( secId, butLab );
        $("#editsectionmodal").modal('hide');
    });




}

function drop_endpoint( dragged, dropped ) {

    if ( dragged.attr('id').match( /^section_/ ) ) {
        // we just dropped a section!

        var section_id = parse_section_id( dragged.attr('id') );

        // get where we just dropped a section..
        var position = dragged.position();
        var section_data = {
            pos_left: position.left,
            pos_top:  position.top
        };
        // update the section with the information..
        update_section( section_id, section_data, function() { } );

    }
    else {
        // we just dropped an end point!
        alert('Dropped:' + dropped.attr('id') + ' --> ' + dragged.attr('id') );
    }

}

function parse_section_id ( secID ) {

    var myRegexp = /^section_([0-9]+)$/;
    var match = myRegexp.exec(secID);

    if ( match != null ) return match[1];

    return secID;
}

function dialog_for_onward_section( from_section_id ) {

    // open modal/dialog to get data for new (onward) section..
    $("#onwardsectionmodal").modal('show')
    $("#onwardsection_form")[0].reset();
    $("input:hidden[name=outward_section_id]" ).val( from_section_id );
}


function add_section( chart ) {

    chart.newSection( function(section){ build_chart_visual( section.chart ) } );

}

function update_section ( secID, secData, afterUpdateFunc ) {

    $.ajax({
        url: '/rest/build/section/' + secID,
        type: "PUT",
        data: secData,
        success: function( section ) {
            afterUpdateFunc( section );
        }
    });

}

function del_section( section_id ) {

    $.ajax({ 
        url: '/rest/build/section/' + section_id,
        type: "DELETE",
        success: function( section ) { 
            // remove old section and any edges
            remove_section_node( section_id );
        } 
    });
}
