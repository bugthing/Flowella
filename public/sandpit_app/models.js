
// Models 

// REST Base Model
Flowella.RESTModel = Ember.Object.extend({
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

// REST Sub Models

Flowella.ChartModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/chart',
    resourceProperties: ['name', 'sections', 'edges'],
});

Flowella.SectionModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/section',
    resourceProperties: ['name','pos_left','pos_top','display_html','section_lines'],
});

Flowella.SectionlineModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/section_line',
    resourceProperties: ['section_id','edit_html'],
    // method that puts what you give it (data from 'edit_html' form)
    putFormData: function( data ) {
        return this._doREST( 'PUT', data );
    },
});

// Simple Models

Flowella.EdgeModel = Ember.Object.extend({
    fromSectionId: 0,
    toSectionId: 0,
    label: ''
});

Flowella.ToolModel = Ember.Object.extend({
    ref: Ember.required(),
    name: Ember.required()
});

