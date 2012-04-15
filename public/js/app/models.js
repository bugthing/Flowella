/*--------------------------------------------------------------------------
 * Flowella (FApp) - EmberJS based JavaScript
 *--------------------------------------------------------------------------*/

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
       var attrs = this.resourceProperties;
       attrs.push('id');
       for( var i=0; i < attrs.length; i++ ) {
           var fname = attrs[i];
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

