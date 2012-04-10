
/*--------------------------------------------------------------------------
 * Flowella - JavaScript supporting lib
 *
 * Requires: jQuery
 *--------------------------------------------------------------------------*/

/*
 * Flowella base object.
 */
var Flowella = function( options ) {

    var whenInitFunc = function(){};
    if ( typeof options.whenReady !== 'undefined' ) whenInitFunc = options.whenReady;

    this.base_url = '';
    if ( typeof options.baseUrl !== 'undefined' ) this.base_url = options.baseUrl;

    // properties
    this.chart_id   = 0;
    this.reading_id = 0;
    this.tools      = {};
    this.charts     = {};
    this.readings   = {};
    this.builder    = { loadBuilder: typeof options.loadBuilder !== 'undefined' ? true : false };

    this.username   = 'reader';
    this.password   = 'readMePlease';

    // internal properties 
    this._ajax_requests  = 0;
    this._ajax_responses = 0;

    // start off by loading the base parts of the system, passing in function
    // to call when we think we have been loaded.
    this.init( whenInitFunc );


};

Flowella.prototype = {

    _whenAjaxDone: function( whenDoneFunc ) {

        var this_flowella = this;

        // this method uses the '_ajax_requests' and '_ajax_responses' to try 
        // and tell when all ajax requests have been completed, when they are
        // the same value we asume all requests are complete and a passed in 
        // function is invoked. (crappy, but works for now)
        if ( typeof whenDoneFunc == 'function' ) {
            var invokeWhenReady = function() {
                if ( this_flowella._ajax_requests == this_flowella._ajax_responses ) {
                    whenDoneFunc( this_flowella );
                    clearInterval(t);
                }
            };
            var t = setInterval(invokeWhenReady , 1000);
        }
    },

    _restCreate: function ( url, json, whenCreatedFunc ) {

        var this_flowella = this;

        var createdResponse; // this var gets filled in a callback

        // function to make a REST type create call.
        this_flowella._ajax_requests++;
        var url = this_flowella.base_url + url;
        jQuery.post(
            url,
            json,
            function( responseJson ) {
                this_flowella._ajax_responses++;
                createdResponse = responseJson;
            },
            'json'
        );

        var callWithCreatedArg = function () { 
            whenCreatedFunc( createdResponse ); 
        }

        // when flowella thinks its ready, call the passed in function.
        this_flowella._whenAjaxDone( callWithCreatedArg );
    },

    init: function( whenInitFunc ) {

        var this_flowella = this;


        // load charts from remote
        this_flowella.loadCharts();

        // load readings from remote
        this_flowella.loadReadings();
    
        // init the BUILDER if it looks like we should..
        if ( this.builder.loadBuilder !== 'undefined' ) {
            this.builder = this.loadBuilder();
        }

        // when flowella thinks its ready, call the passed in function.
        this_flowella._whenAjaxDone( whenInitFunc );
    },

    loadReadings: function() {

        var this_flowella = this;

        // load readings from remote
        this_flowella._ajax_requests++;
        this_flowella.readings = {}; // clear out 

        var url = this_flowella.base_url + '/rest/read/readings';
        jQuery.getJSON(
            url,
            {   
                username: this_flowella.username,
                password: this_flowella.password,
            }, 
            function(readings) {
                jQuery.each(readings, function(index, reading) {
                    this_flowella.readings[ reading.id ] = reading;
                });
                this_flowella._ajax_responses++;
            }
        );
    },

    loadCharts: function () {

        var this_flowella       = this;

        // load charts from remote
        this_flowella._ajax_requests++;
        this_flowella.charts = {}; // clear out

        var url = this_flowella.base_url + '/rest/read/charts';
        jQuery.getJSON(
            url,
            {   
                username: this_flowella.username,
                password: this_flowella.password,
            }, 
            function(charts) {
                jQuery.each(charts, function(index, chart) {
                    this_flowella.charts[ chart.id ] = chart;
                });
                this_flowella._ajax_responses++;
            }
        );

    },

    newReading: function( chartId, whenLoadedReadingFunc  ) {

        var this_flowella = this;

        // create the reading
        var new_reading_json = { 
            chart_id: chartId,
            processor_id: 1,
            user_id: 2
        };

        // build function to call when create reading is done
        var whenCreatedFunc = function( newReadingJson ) { 
            var readingId = newReadingJson.id;
            this_flowella.loadReading( readingId, whenLoadedReadingFunc ); // new chart, so re-load (this is not good, but will do.)
        };

        this_flowella._restCreate( '/rest/read/reading', new_reading_json, whenCreatedFunc );
    },
                  
    loadReading: function( readingId, whenLoadedReadingFunc  ) {
        var reading = new Flowella.Reading( this, readingId, whenLoadedReadingFunc );
        return reading;
    },

    loadBuilder: function() {
        var builder = new Flowella.Builder( this );
        return builder;
    }

};


/*
* Reading 
*/

Flowella.Reading = function( flowella, readingId, whenInitFunc ) {

    if ( typeof flowella == 'undefined' ) alert('Can not load reading without flowella object!');
    if ( typeof readingId == 'undefined' ) alert('Can not load reading without reading ID!');
    if ( typeof whenInitFunc == 'undefined' ) whenInitFunc = function(){};

    this.flowella = flowella;
    this.reading_id = readingId;

    this.init( whenInitFunc );
};

Flowella.Reading.prototype = {

    init: function( whenInitFunc ) {

        var this_reading = this;
        var whenLoadedReading = function( readingJson ) {

            this_reading.reading_id = readingJson.id;
            this_reading.display_html = readingJson.display_html;

            whenInitFunc( this_reading );
        }

        // get reading data from rest api
        var url = this.flowella.base_url + '/rest/read/reading/' + this.reading_id;
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
            reading_json = reading_json + '&' + submit_clicked_name + '=' + submit_clicked_value;

            // update the reading..
            var postUrl = this_reading.flowella.base_url + '/rest/read/reading/' + this_reading.reading_id;
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

/*
* Builder
*/
Flowella.Builder = function( flowella ) {

    if ( typeof flowella == 'undefined' ) alert('Can not load reading without flowella object!');

    this.flowella = flowella;
    this.tools = {}; 

    this.init();
};

Flowella.Builder.prototype = {

    init: function( ) {
        this.loadTools();
    },

    loadTools: function() {

        this.tools = {}; // clear out 
        var this_builder = this;

        // load tools from remote
        var url = this.flowella.base_url + '/rest/build/tools';
        jQuery.getJSON(
            url,
            {
                username: this.flowella.username,
                password: this.flowella.password,
            },
            function(tools) {
              jQuery.each(tools, function(index, tool) {
                  this_builder.tools[ tool.ref ] = tool;
              });
            }
        );

    },

    newChart: function( newName, whenCreatedChartFunc  ) {

        var this_builder = this;

        var new_chart_json = { name: newName };

        // build function to call when create chart is done
        var whenCreatedFunc = function( newChart ) { 
            this_builder.flowella.loadCharts(); // new chart, so re-load
            // .. when loaded, run the passed in function..
            this_builder.flowella._whenAjaxDone( function(){ whenCreatedChartFunc( newChart ); } );
        };

        this.flowella._restCreate( '/rest/build/chart', new_chart_json, whenCreatedFunc );

    },

    loadChart: function( chartId, whenLoadedChartFunc  ) {
        var chart = new Flowella.Chart( this, chartId, whenLoadedChartFunc );
        return chart;
    },

};

/*
* Chart
*/

Flowella.Chart = function( builder, chartId, whenInitFunc ) {

    if ( typeof builder == 'undefined' ) alert('Can not load chart without builder object!');
    if ( typeof chartId == 'undefined' ) alert('Can not load chart without reading ID!');
    if ( typeof whenInitFunc == 'undefined' ) whenInitFunc = function(){};

    this.builder = builder;
    this.chart_id = chartId;
    this.name     = '';
    this.sections = [];
    this.edges    = [];

    this.init( whenInitFunc );
};

Flowella.Chart.prototype = {

    init: function( whenInitFunc ) {

        var this_chart = this;
        var whenLoadedChart = function( chartJson ) {

            this_chart.chart_id   = chartJson.id;
            this_chart.name       = chartJson.name;
            this_chart.sections   = chartJson.sections;
            this_chart.edges      = chartJson.edges;

            whenInitFunc( this_chart );
        }

        // get chart data from rest api
        var url = this.builder.flowella.base_url + '/rest/build/chart/' + this.chart_id;
        jQuery.getJSON(
            url,
            {   
                username: this.builder.flowella.username,
                password: this.builder.flowella.password,
            }, 
            whenLoadedChart
        );

    },

    newOnwardSection: function( outwardSectionId, onwardLabel, whenLoadedSectionFunc  ) {

        var this_chart = this;

        // make ajax call to create onward section..
        // (currently hacked to only work for button_next!! TBA)
        var onwardsection_data = {
            chart_id: this_chart.chart_id,
            tool_ref: 'buttons_next',
            buttons_next_counter: 1,
            buttons_next_label_1: onwardLabel,
            outward_section_id: outwardSectionId
        }

        // build function to call when create reading is done
        var whenCreatedFunc = function( newSectionJson ) {
            var section_Id = newSectionJson.id;

            // here should add the new section to 'this_chart.sections' array
            this_chart.sections.push( newSectionJson );

            //.. also add the new edge ..
            this_chart.edges.push( [ outwardSectionId, section_Id, { label: onwardLabel } ] );

            this_chart.loadSection( section_Id, whenLoadedSectionFunc );
        };

        this_chart.builder.flowella._restCreate( '/rest/build/onward_section', onwardsection_data, whenCreatedFunc );
    },

    newSection: function( whenLoadedSectionFunc  ) {

        var this_chart = this;

        var new_section_json = { 'chart_id' : this_chart.chart_id };

        // build function to call when create reading is done
        var whenCreatedFunc = function( newSectionJson ) {
            var section_Id = newSectionJson.id;

            // here should add the new section to 'this_chart.sections' array
            this_chart.sections.push( newSectionJson );
            //.. also add the edges..
            for ( e in newSectionJson.onward_edges ) {
                var new_edge = newSectionJson.onward_edges[e];
                this_chart.edges.push( new_edge );
            }

            this_chart.loadSection( section_Id, whenLoadedSectionFunc );
        };

        this_chart.builder.flowella._restCreate( '/rest/build/section', new_section_json, whenCreatedFunc );
    },

    loadSection: function( sectionId, whenLoadedSectionFunc  ) {
        var section = new Flowella.Section( this, sectionId, whenLoadedSectionFunc );
        return section;
    },
};

/*
* Section
*/

Flowella.Section = function( chart, sectionId, whenInitFunc ) {

    if ( typeof chart == 'undefined' ) alert('Can not load section without chart object!');
    if ( typeof sectionId == 'undefined' ) alert('Can not load section without reading ID!');
    if ( typeof whenInitFunc == 'undefined' ) whenInitFunc = function(){};

    this.chart = chart;
    this.section_id = sectionId;
    this.chart_id   = 0;
    this.name           = '';
    this.section_lines  = [];
    this.display_html   = '';

    this.init( whenInitFunc );
};

Flowella.Section.prototype = {
    init: function( whenInitFunc ) {

        var this_section = this;
        var whenLoadedSection = function( sectionJson ) {

            this_section.section_id    = sectionJson.id;
            this_section.chart_id      = sectionJson.chart_id;
            this_section.name          = sectionJson.name;
            this_section.section_lines = sectionJson.section_lines;
            this_section.display_html  = sectionJson.display_html;

            whenInitFunc( this_section );
        }

        // get section data from rest api
        var url = this.chart.builder.flowella.base_url + '/rest/build/section/' + this.section_id;
        jQuery.getJSON(
            url,
            {   
                username: this.chart.builder.flowella.username,
                password: this.chart.builder.flowella.password,
            }, 
            whenLoadedSection
        );

    },

    newSectionLine: function( toolRef, whenLoadedSectionLineFunc  ) {

        var this_section = this;

        var new_section_line_json = {
            section_id: this_section.section_id,
            tool_ref: toolRef
        };

        // build function to call when create reading is done
        var whenCreatedFunc = function( newSectionLineJson ) {
            var section_lineId = newSectionLineJson.id;

            // here should add the new section_line to 'this_section.section_lines' array

            this_section.loadSectionLine( section_lineId, whenLoadedSectionLineFunc );
        };

        this_section.chart.builder.flowella._restCreate( '/rest/build/section_line', new_section_line_json, whenCreatedFunc );
    },

    loadSectionLine: function( section_lineId, whenLoadedSectionLineFunc  ) {
        var section_line = new Flowella.SectionLine( this, section_lineId, whenLoadedSectionLineFunc );
        return section_line;
    },
};

/*
* SectionLine
*/

Flowella.SectionLine = function( section, section_lineId, whenInitFunc ) {

    if ( typeof section == 'undefined' ) alert('Can not load section_line without section object!');
    if ( typeof section_lineId == 'undefined' ) alert('Can not load section_line without reading ID!');
    if ( typeof whenInitFunc == 'undefined' ) whenInitFunc = function(){};

    this.section = section;
    this.section_line_id = section_lineId;
    this.section_id      = 0;
    this.edit_html       = '';

    this.init( whenInitFunc );
};

Flowella.SectionLine.prototype = {

    init: function( whenInitFunc ) {

        var this_section_line = this;
        var whenLoadedSectionLine = function( section_lineJson ) {

            this_section_line.section_line_id = section_lineJson.id;
            this_section_line.section_id      = section_lineJson.section_id;
            this_section_line.edit_html       = section_lineJson.edit_html;

            whenInitFunc( this_section_line );
        }

        // get section_line data from rest api
        var url = this.section.chart.builder.flowella.base_url + '/rest/build/section_line/' + this.section_line_id;
        jQuery.getJSON(
            url,
            {   
                username: this.section.chart.builder.flowella.username,
                password: this.section.chart.builder.flowella.password,
            }, 
            whenLoadedSectionLine
        );

    },

    updateSectionLine: function( section_line_data, whenUpdatedFunc ) {

        var this_section_line = this;

        var whenLoadedSectionLine = function( section_lineJson ) {

            this_section_line.section_line_id = section_lineJson.id;
            this_section_line.section_id      = section_lineJson.section_id;
            this_section_line.edit_html       = section_lineJson.edit_html;
            this_section_line.success         = section_lineJson.success;

            whenUpdatedFunc( this_section_line );
        }

        // update the section line..
        var putUrl = this_section_line.section.chart.builder.flowella.base_url + '/rest/build/section_line/' + this.section_line_id;
        $.ajax({
            type: "PUT",
            url: putUrl,
            data: section_line_data,
            dataType: "json",
            success: whenLoadedSectionLine,
        });

    },

    deleteSectionLine: function ( whenDeletedFunc ) {

      var this_section_line = this;

      var delUrl = this_section_line.section.chart.builder.flowella.base_url +  '/rest/build/section_line/' + this_section_line.section_line_id;

      $.ajax({
          url: delUrl,
          type: "DELETE",
          success: function( section_lineJson ) {

            // delete this section_line from the parent section.
            for( i in this_section_line.section.section_lines ) {
                stored_sec_line = this_section_line.section.section_lines[i];
                if( stored_sec_line.id = this_section_line.section_line_id ) {
                     this_section_line.section.section_lines.splice(i,1);
                }
            }
            whenDeletedFunc( this_section_line );
          }
      });

    },
};
