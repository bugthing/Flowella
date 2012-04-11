/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *
 * Requires: jQuery, EmberJS
 *--------------------------------------------------------------------------*/

var FApp = Ember.Application.create({
    ready: function() {
        FApp.toolsController.load();
        FApp.chartsController.load();

        // old skool way of enabling modals.. must replace..
        enable_modals();
    },
});

/*- MODELS -----------------------------------------------------------------*/

// REST base class

FApp.RESTModel = Ember.Object.extend({
    resourceUrl:  Ember.required(),
    getREST: function() {
        return this._doREST( 'GET' );
    },
    delREST: function() {
        var data = { id: this.get('id') };
        return this._doREST( 'DELETE', data );
    },
    putREST: function() { 
        var data = this.serialize();
        return this._doREST( 'PUT', data );
    },
    postREST: function() { 
        var data = this.serialize();
        return this._doREST( 'POST', data );
    },

    _doREST: function( method, data ) {
        var self = this;
        var resourceUrl = self._resourceUrl();
        return jQuery.ajax({
          url: resourceUrl,
          dataType: 'json',
          type: method,
          'data': data
        }).done( function(json) {
          self.deserialize(json);
        });
    },
    deserialize: function( json ) {
       for( var i=0; i < this.resourceProperties.length; i++ ) {
           var fname = this.resourceProperties[i];
           if ( typeof(json[fname]) !== 'undefined' ) {
               this.set(fname, json[fname]);
           }
       }
    },
    serialize: function() {
        var props = this.resourceProperties;
        var ret = {};
        for(var i = 0; i < props.length; i++) {
          var prop = props[i];
          var val = this.get(prop);
          if ( typeof(val) !== 'undefined' ) ret[prop] = val;
        }
        return ret;
    },
    _resourceUrl: function() {
        var thisId = this.get('id');
        var urlPrefix = '';
        if ( typeof(thisId) !== 'undefined' ) urlPrefix = '/' + thisId;
        return this.resourceUrl + urlPrefix;
    }
});

// REST sub classes

FApp.ChartModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/chart',
    resourceProperties: ['name', 'sections', 'edges'],
});

FApp.SectionModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/section',
    resourceProperties: ['name','chart_id','pos_left','pos_top','display_html','section_lines'],
});

FApp.SectionlineModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/section_line',
    resourceProperties: ['section_id','edit_html','tool_ref'],
    // method that puts what you give it (data from 'edit_html' form)
    putFormData: function( data ) {
        return this._doREST( 'PUT', data );
    },
});

// Simple Models

FApp.EdgeModel = Ember.Object.extend({
    fromSectionId: 0,
    toSectionId: 0,
    label: ''
});

FApp.ToolModel = Ember.Object.extend({
    ref: Ember.required(),
    name: Ember.required()
});

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
                        // add this buildUrl to link to builder
                        buildUrl: function() { 
                            var id = this.getPath('id');
                            return '/builder?chart=' + id; 
                        }.property('id'),
                    })
                );
            }
        })
        .error(function() { alert('error getting charts'); });
    },
});

FApp.chartController = Ember.Object.create({
    chart: Ember.required(),
    loadVisualArea: function() {
        this.get('chart').getREST().success( function(){
            // should now build chart
            build_chart_visual()
        });
    }.observes('chart'),

    title: function() {
        return this.get('chart').name;
    }.property('chart'),

    showSectionEditor: function ( sectionID ) {
        FApp.sectionController.set('section', FApp.SectionModel.create({ 'id': sectionID }) );
    },
    addNewSection: function ( baseSecID ) {
        var chartId = this.get('chart').id;
        var newSection = FApp.SectionModel.create({ 'chart_id': chartId });
        newSection.postREST().success( function() {
            FApp.sectionController.set('section', newSection);
            FApp.chartController.loadVisualArea();
        });
    },
    delSection: function( sectionId ) {
        var sec = FApp.SectionModel.create({ 'id': sectionId });
        sec.delREST().success( function() {
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
});

FApp.sectionController = Ember.Object.create({
    section:  Ember.required(),
    loadEditArea: function() {
        this.get('section').getREST().success( function(){

            // New way! dd to SectionLines controller array 
            var sec = FApp.sectionController.get('section');
            var sectionLines = new Array();
            for( var i=0; i < sec.section_lines.length; i++ ) {
                var sl =  FApp.SectionlineModel.create({
                    id: sec.section_lines[i].id,
                    tool_ref: sec.section_lines[i].tool_ref,
                    weight: sec.section_lines[i].weight
                });
                sectionLines.push(sl);
            }
            //FApp.sectionLinesController.set('content', sectionLines);

            // old way to show edit area..
            build_section_edit_area();

        });
    }.observes('section'),

    updateName: function( name ) {
        var sec = this.get('section');
        sec.set('name', name );
        
        // do rubbish hack so we only send 'name'..
        var rp = sec.resourceProperties;
        sec.resourceProperties = ['name'];

        sec.putREST().success( function() {
            FApp.chartController.loadVisualArea();
        });
    
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

                if ( index === finalIndex ) {
                    // if last sectionline response, reload chart
                    FApp.chartController.loadVisualArea();
                }

            });

        });
    },

});

// ArrayBased controller to hold a list of section lines..
FApp.sectionLinesController = Ember.ArrayController.create({
    buildSectionLineEdits: function() {

        this.get('content').forEach(function(secLine) {
            secLine.getREST().success( function(){
                //console.log('controller:' + secLine);
                //FApp.editSectionLineView = FApp.SectionLineEditView.create({
                //    'sectionLine' : secLine
                //});
                //FApp.editSectionLineView.appendTo('#section_editarea');
            });
        });
 
        // display the editor view..       
        FApp.SectionEditorView.create({
        //    section: FApp.sectionController.get('section')
        }).appendTo('body');

    }.observes('content'),
    updateSectionLines: function( sectionLinesUpdateData ) {
        this.get('content').forEach(function(secLine) {
            var updateData = sectionLinesUpdateData[ secLine.id ];
            if ( typeof(updateData) !== 'undefined' ) secLine.putFormData( updateData );
        });
        // TODO - update chart/section and give response message 
    }
});


/*- VIEWS ------------------------------------------------------------------*/

FApp.ToolButtonView = Ember.View.extend({
    tool:  Ember.required(),
    id: function(){
        return this.get('tool').ref;
    }.property('tool'),
    click: function(evt) {
        var toolRef = Ember.getPath(this, 'tool.ref');
        FApp.toolsController.applyToolToSection( toolRef );
    }
});

FApp.SectionEditorView = Ember.View.extend({
    templateName: 'section-editor-modal',
    sectionLinesBinding: 'FApp.sectionLinesController',

    dismissModal: function() {
        alert('closing..');
    },
    saveSectionLines: function() {  
        alert('saving..');
    }
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


/*- HandleBars - helper ----------------------------------------------------*/
// (crap way of html escaping)

Handlebars.registerHelper('section_line_edit', function(property) {
    var value = Ember.getPath(this, property);
    if ( typeof(value) === 'undefined') value = '';
    return new Handlebars.SafeString( value );
});

