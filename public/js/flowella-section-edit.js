


function build_section_edit_area() {

    var section = FApp.sectionController.get('section');

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

    // draw all the existing section lines
    section.section_lines.forEach(function(secLineID) {
        FApp.sectionController.loadSectionLine( secLineID.id );
    });

    // configure new area for dropping tools in
    $("#sectionedit").droppable({
        accept: '.charttool',
        drop: function(event, ui) {
            var tool_ref = ui.draggable.attr('id');
            section.newSectionLine( tool_ref, whenLoadedFunc );
        }
    });

}

function build_section_line_edit_area( section_line ) {

    var anchor_id = 'section_line_' + section_line.id + '_anchor'

    $('#newformitems').append(
        '<div class="sectionlineedit form-stacked" id="edit_html_'
        + section_line.id
        + '">'
        + '<a class="close" id="' + anchor_id + '">×</a>'
        +   section_line.edit_html
        + '</div>'
    );
    $('a#' + anchor_id ).click( function() { del_section_line( section_line ) } );
}

function submit_section_lines ( section ) {
    FApp.sectionController.submitSectionLines();
}

function del_section_line( section_line ) {
    FApp.sectionController.delSectionLine( section_line.id );
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
    var secName = $('#section_name_form :input[name=section_name]').val();
    FApp.sectionController.updateName( secName );
    var secID   = $('#section_name_form :input[name=section_id]').val();
    draw_section_name( secID, secName );
}

function draw_section_name(secID, secName) {
    $('#section_title').empty();
    $('#section_title').html(
        '<a href="javascript: edit_section_name(' + secID + ', \'' + secName + '\')">'
        + '<h3>' + secName + '</h3></a>'
    );
}
