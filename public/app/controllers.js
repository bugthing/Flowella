
// Controllers

Flowella.toolsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/build/tools', function() {})
        .success(function(json) {
            // clear out the list..
            Flowella.toolsController.set("content", [] );
            // add content back in one by one..
            for (var i=0; i < json.length; i++) {
                Flowella.toolsController.pushObject(
                    Flowella.ToolModel.create({
                        ref: json[i].ref,
                        name: json[i].name
                    })
                );
            }
        })
        .error(function() { alert('error getting tools'); });
    }
});

Flowella.chartsController = Ember.ArrayController.create({
    load: function() {
        var jqxhr = jQuery.getJSON('/rest/read/charts', function(){})
        .success(function(json) {
            // clear out the list..
            Flowella.chartsController.set("content", [] );
            // add content into this array object one by one..
            for (var i=0; i < json.length; i++) {
                Flowella.chartsController.pushObject( 
                    Flowella.ChartModel.create({
                        id: json[i].id,
                        name: json[i].name,
                    })
                );
            }
        })
        .error(function() { alert('error getting charts'); });
    }
});

