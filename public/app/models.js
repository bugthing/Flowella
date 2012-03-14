
// Models 

// REST Base Model
Flowella.RESTModel = Ember.Object.extend({
    resourceUrl:  Ember.required(),
    get: function() {
        var self = this;
        return jQuery.ajax({
          url: this._resourceUrl(),
          dataType: 'json',
          type: 'GET'
        }).done( function(json) {
          self.deserialize(json);
        });
    },
    deserialize: function( json ) {
        if( typeof(this.resourceProperties ) == 'Array' ) {
            for( var i=0; i < this.resourceProperties.length; i++ ) {
                var fname = this.resourceProperties[i];
                if ( typeof(json[fname]) !== 'undefined' ) {
                    this.set(fname, json[fname]);
                }
            }
        }
    },
    _resourceUrl: function() {
        var this_id = this.id;
        return this.resourceUrl + '/' + this_id;
    }
});

// REST Sub Models

Flowella.ChartModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/chart',
    deserialize: function(json) {
        Ember.beginPropertyChanges(this);

        this.set('id',   json.id );
        this.set('name', json.name );
    
        // build array of section objects..
        var sections = new Array();
        for( var i=0; i < json.sections.length; i++ ) {
            sections.push(
                Flowella.SectionModel.create({
                    id: json.sections[i].id,
                    name: json.sections[i].name,
                    pos_left: json.sections[i].pos_left,
                    pos_top: json.sections[i].pos_top
                })
            );
        }
        this.set('sections', sections );

        // build array of edge objects..
        var edges = new Array();
        for( var i=0; i < json.edges.length; i++ ) {
            edges.push(
                Flowella.EdgeModel.create({
                    fromSectionId: json.edges[i][0],
                    toSectionId: json.edges[i][1],
                    label: json.edges[i][2].label
                })
            );
        }
        this.set('edges', edges );

        Ember.endPropertyChanges(this);
        return this;
    }
});

Flowella.SectionModel = Ember.Object.extend({
    id: Ember.required(),
    name: '',
    pos_left: 0,
    pos_top: 0,
    divId: function() {
        return 'section_' + this.get('id'); 
    }.property('id')
});

Flowella.SectionRESTModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/section',
    resourceProperties: ['name','pos_left','pos_top'],
});

Flowella.SectionlineRESTModel = Flowella.RESTModel.extend({
    resourceUrl:  '/rest/build/section_line',
    resourceProperties: ['name','pos_left','pos_top'],
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

