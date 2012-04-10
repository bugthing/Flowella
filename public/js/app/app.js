/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *
 * Requires: jQuery, EmberJS
 *--------------------------------------------------------------------------*/

var FApp = Ember.Application.create({
    ready: function() {
        FApp.chartsController.load();
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
        var props = this.resourceProperties,
            prop,
            ret = {};

        ret = {};
        for(var i = 0; i < props.length; i++) {
          prop = props[i];
          ret[prop] = this.get(prop);
        }
        return ret;
    },
    _resourceUrl: function() {
        var this_id = this.get('id');
        return this.resourceUrl + '/' + this_id;
    }
});

// REST sub classes

FApp.ChartModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/chart',
    resourceProperties: ['name', 'sections', 'edges'],
});

FApp.SectionModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/section',
    resourceProperties: ['name','pos_left','pos_top','display_html','section_lines'],
});

FApp.SectionlineModel = FApp.RESTModel.extend({
    resourceUrl:  '/rest/build/section_line',
    resourceProperties: ['section_id','edit_html'],
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
                        name: json[i].name
                    })
                );
            }
        })
        .error(function() { alert('error getting tools'); });
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
