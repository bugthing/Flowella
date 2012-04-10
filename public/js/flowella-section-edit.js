
function build_section_edit_area( section ) {

    // get and fill section editing area.
    //$.getJSON('/rest/build/section/' + section.section_id, function(sec) {

        // fill the section edit div with html
        $('#newform').html( 
              '<div>'
            +   '<div id="section_title"></div>'
            +   '<div id="newformitems"></div>'
            +   '<form>'
            +     '<input type="Button" name="submit_section_line_forms" value="Save" class="btn large primary">'
            +   '</form>'
            + '</div>'
        );
        // hook up form submission..
        var onsubmitSectionLines = function() {
            submit_section_lines( section )
        }
        $('input[name="submit_section_line_forms"]').click( onsubmitSectionLines );

        $('#newformitems').sortable();

        draw_section_name( section.section_id, section.name );

        var whenLoadedFunc = function( sl ) { build_section_line_edit_area( sl ) };

        // draw all the existing section lines
        for( i in section.section_lines ) {
            var id = section.section_lines[i].id;
            section.loadSectionLine( id, whenLoadedFunc );
        }

        //$.each(sec.section_lines, function(index, this_section_line) {
        //    build_section_line_edit_area( this_section_line.id );
        //});

        // configure new area for dropping tools in
        $("#sectionedit").droppable({
            accept: '.charttool',
            drop: function(event, ui) {
                var tool_ref = ui.draggable.attr('id');
    
                section.newSectionLine( tool_ref, whenLoadedFunc );

                //var new_section_line_json = {
                //    section_id: section.section_id, 
                //    tool_ref: tool_ref
                //};

                //section.newSectionLine

                //// ..  call to create a new section line
                //$.ajax({ 
                //    url: '/rest/build/section_line',
                //    type: "POST",
                //    data: new_section_line_json,
                //    dataType: "json",
                //    success: function( section_lineJson ) { 

                //        build_section_line_edit_area( section_line.id );
                //    } 
                //});
            }
        });

    //});
}

function build_section_line_edit_area( section_line ) {

    var anchor_id = 'section_line_' + section_line.section_line_id + '_anchor'

    $('#newformitems').append(
        '<div class="sectionlineedit form-stacked" id="edit_html_'
        + section_line.section_line_id
        + '">'
        + '<a class="close" id="' + anchor_id + '">×</a>'
        +   section_line.edit_html
        + '</div>'
    );
    $('a#' + anchor_id ).click( function() { del_section_line( section_line ) } );
}

function submit_section_lines ( section ) {

    // find all forms within the div, serialize and do ajax call
    var section_line_weight = 0;
    $('#newformitems').find('.sectionlineedit').each( function( index, section_line_div ) { 

        var myRegexp = /^edit_html_([0-9]+)$/;
        var match = myRegexp.exec( section_line_div.id );
        var section_line_id = match[1];

        var section_line = section.loadSectionLine( section_line_id, function() {} );

        var section_line_form   = $(section_line_div).find('form');
        var section_line_data   = $(section_line_form).serializeArray();

        // add weight to the json ..
        section_line_weight++;
        section_line_data.push({
            name: 'weight',
            value: section_line_weight
        });
        section_line_data.weight = section_line_weight;


        draw_section_line( section_line )
        
        var whenUpdatedFunc = function( section_line ) {

            if ( section_line.success == 1 ) {
                $(section_line_div).attr('class', "alert-message success");
                $(section_line_div).html( 'saved section_line:' + section_line.section_line_id);
            }
            else {
                $(section_line_div).html( section_line.edit_html );
            }

        }
        section_line.updateSectionLine( section_line_data, whenUpdatedFunc )

    });

    // draw the chart again as has likely changed.
    build_chart_visual( section.chart )

    // should be abit more clever about this and only add any new edges.. for now redraw whole chart! :(
    //build_section_edit_area( section );
}

function draw_section_line( section_line ) {

}

function del_section_line( section_line ) {

    var whenDeletedFunc = function( section_line ) { 
        build_section_edit_area( section_line.section )
    };

    section_line.deleteSectionLine( whenDeletedFunc );
}

function edit_section_name( secID, secName ) {
    $('#section_title').empty();
    $('#section_title').html(
        '<form id="section_name_form">'
        +     '<input type="hidden" name="section_id" value="'+ secID +'">'
        +     '<input type="text" name="section_name" value="'+ secName +'">'
        +     '<input type="Button" name="section_name_butt" value="OK" class="btn small primary" onClick="submit_section_name()">'
        + '</form>'
    );
}
 
function submit_section_name() {
    
    var secID   = $('#section_name_form :input[name=section_id]').val();
    var secName = $('#section_name_form :input[name=section_name]').val();

    var section_data = {
        name: secName
    };

    // update the section..
    update_section( secID, section_data, function( section ) { 
        // .. then, draw section name in plain text..
        draw_section_name( section.id, section.name );
        // .. then, draw node again in chart..
        draw_section_node( section.id, section.name );
    });

}

function draw_section_name(secID, secName) {
    $('#section_title').empty();
    $('#section_title').html(
        '<a href="javascript: edit_section_name(' + secID + ', \'' + secName + '\')">'
        + '<h3>' + secName + '</h3></a>'
    );
}

