
/*--------------------------------------------------------------------------
 * Flowella - JavaScript supporting lib to read Flowella processes
 *
 * Requires: jQuery
 *--------------------------------------------------------------------------*/

/*
 * Flowella base object.
 */
var Flowella = function( options ) {

    // process the options passed in.
    var whenInitFunc = function(){};
    if ( typeof options.whenReady !== 'undefined' ) whenInitFunc = options.whenReady;
    this.baseURL = '';
    if ( typeof options.baseURL !== 'undefined' ) this.baseURL = options.baseURL;

    // setup some default values.
    this.charts          = {};
    this.readings        = {};
    this._ajax_requests  = 0;
    this._ajax_responses = 0;

    // start off by loading the base parts of the system, passing in function
    // to call when we think we have been loaded.
    this.init( whenInitFunc );
};
Flowella.prototype = {
    init: function( whenInitFunc ) {
        // load charts from remote
        this.loadCharts();
        // load readings from remote
        this.loadReadings();
        // when flowella thinks its ready, call the passed in function.
        this._whenAjaxDone( whenInitFunc );
    },
    loadReadings: function() {

        var self = this; // preserve scope
        var url = this.baseURL + '/rest/read/readings';
        self._ajax_requests++;
        jQuery.getJSON( url, function(readings) {
            self._ajax_responses++
            jQuery.each(readings, function(index, reading) {
                self.readings[ reading.id ] = reading;
            });
        });
    },
    loadCharts: function () {

        var self = this; // preserve scope
        var url = self.baseURL + '/rest/read/charts';
        self._ajax_requests++;
        jQuery.getJSON( url, function(charts) {
            self._ajax_responses++
            jQuery.each(charts, function(index, chart) {
                self.charts[ chart.id ] = chart;
            });
        });
    },

    // this method uses the '_ajax_requests' and '_ajax_responses' to try 
    // and tell when all ajax requests have been completed, when they are
    // the same value we asume all requests are complete and a passed in 
    // function is invoked. (crappy, but works for now)
    _whenAjaxDone: function( whenDoneFunc ) {
        var self = this; // preserve scope
        if ( typeof whenDoneFunc == 'function' ) {
            var invokeWhenReady = function() {
                if ( self._ajax_requests == self._ajax_responses ) {
                    whenDoneFunc( self );
                    clearInterval(t);
                }
            };
            var t = setInterval(invokeWhenReady , 1000);
        }
    },

    _restCreate: function ( url, json, whenCreatedFunc ) {
        var self = this; // preserve scope
        var createdResponse; // this var gets filled in a callback
        // function to make a REST type create call.
        self._ajax_requests++;
        var url = self.baseURL + url;
        jQuery.post( url, json, function( responseJson ) {
            self._ajax_responses++;
            createdResponse = responseJson;
        }, 'json');
        var callWithCreatedArg = function () { whenCreatedFunc( createdResponse ) };
        // when flowella thinks its ready, call the passed in function.
        self._whenAjaxDone( callWithCreatedArg );
    },

    newReading: function( chartId, whenLoadedReadingFunc  ) {
        var self = this; // preserve scope
        // create the reading
        var newJSON = {
            chart_id: chartId,
            processor_id: 1,
            user_id: 2
        };
        // build function to call when create reading is done
        var whenCreatedFunc = function( newReading ) {
            var readingID = newReading.id;
            self.loadReading( readingID, whenLoadedReadingFunc ); // new chart, s
        };
        self._restCreate( '/rest/read/reading', newJSON, whenCreatedFunc );
    },
    loadReading: function( readingID, whenLoadedReadingFunc  ) {
        var reading = new Flowella.Reading( this, readingID, whenLoadedReadingFunc );
        return reading;
    },

};

/*
* Reading 
*/

Flowella.Reading = function( flowella, readingID, whenInitFunc ) {

    if ( typeof flowella == 'undefined' ) alert('Can not load reading without flowella obj');
    if ( typeof readingID == 'undefined' ) alert('Can not load reading without reading ID!');
    if ( typeof whenInitFunc == 'undefined' ) whenInitFunc = function(){};

    this.flowella = flowella;
    this.readingID = readingID;

    this.init( whenInitFunc );
};

Flowella.Reading.prototype = {

    init: function( whenInitFunc ) {

        var this_reading = this;
        var whenLoadedReading = function( readingJson ) {

            this_reading.readingID = readingJson.id;
            this_reading.display_html = readingJson.display_html;

            whenInitFunc( this_reading );
        }

        // get reading data from rest api
        var url = this.flowella.baseURL + '/rest/read/reading/' + this.readingID;
        jQuery.getJSON(
            url,
            {
                username: this.flowella.username,
                password: this.flowella.password,
            },
            whenLoadedReading
        );

    },

    show: function( showInSelector ) {

        $('#content').html(
            '<section class="section-box">'
            + '<form id="reading-chartform">'
            + this.display_html
            + '</form>'
            + '</section>'
        );

        var this_reading = this;

        // record which submit was clicked..
        var submit_clicked_name = null;
        var submit_clicked_value = null;
        $('#reading-chartform :submit').click(function() {
            submit_clicked_name = $(this).attr("name");
            submit_clicked_value = $(this).attr("value");
        });

        $('#reading-chartform').submit(function() {

            var reading_json = $('#reading-chartform').serialize();
            // ..hack here coz serialize does not work how I think it should!! >:(
            if ( reading_json.length ) reading_json = reading_json + '&';
            reading_json = reading_json + submit_clicked_name + '=' + submit_clicked_value;

            // update the reading..
            var postUrl = this_reading.flowella.baseURL + '/rest/read/reading/' + this_reading.readingID;
            $.ajax({
                type: "PUT",
                url: postUrl,
                data: reading_json,
                dataType: "json",
                success: function( readingJson ) {
                    var whenLoadedFunc = function(r) { r.show( showInSelector ); }
                    this_reading.init( whenLoadedFunc );
                }
            });

            return false;
        });
    }
};
