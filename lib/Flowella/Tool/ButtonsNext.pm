package Flowella::Tool::ButtonsNext;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;

extends 'Flowella::Tool';
with 'Flowella::Tool::Roles::FormFuEdit';
with 'Flowella::Tool::Roles::TemplateToolkitDisplay';

around 'ref'    => sub { 'buttons_next' };
around 'name'   => sub { 'Multiple Buttons' };

around formfu_config => sub {
    my $orig = shift;
    my $self = shift;

    my $ref = $self->ref;

    return {
        elements => [
            {
                type         => 'Hidden',
                name         => $ref . '_counter',
            },
            {  
                type         => 'Repeatable',
                id           => $ref . '_container',
                counter_name => $ref . '_counter',
                elements => [
                    {  
                        type    => 'Text',
                        name    => $ref . '_label',
                        label   => 'Button Text:',
                        constraints => [
                            {
                                type    => 'Length',
                                min     => 1,
                                message => 'The button should have a label',
                            },
                        ],
                    },
                    {  
                        type    => 'Select',
                        name    => $ref . '_section',
                        label   => 'Next Section:',
                        options => $self->section_select_options,
                    },
                ],
            },
            {  
                type        => 'Src',
                content_xml =>  "<a href=\"javascript: add_repeatable( '$ref' )\"> + </a>" .  
                                "<a href=\"javascript: remove_repeatable( '$ref' )\"> - </a>" . <<'JS'
                <script language='javascript'>
function add_repeatable( baseName ) {
    var counter   = jQuery( ":input[name='" + baseName + "_counter']" );
    var container = jQuery( "#" + baseName + "_container" );

    var oldCount = parseInt(counter.val());
    var newCount = oldCount + 1;

    // get container html and repeat 'after' container..
    var repeatDivID =  baseName + '_repeat_' + newCount;
    var cloneHTML = container.html();
    container.after( '<div id="' + repeatDivID + '">' + cloneHTML + '</div>' );

    // alter the names of cloned form elements
    jQuery("#" + repeatDivID + ' :input').each( function() {
        var inputName = $(this).attr('name');
        var newName = inputName.replace(/\d+$/, newCount);  
        $(this).attr('name', newName);
    });

    // increment counter..
    counter.val ( newCount );
}
function remove_repeatable( baseName ) {
    var counter  = jQuery( ":input[name='" + baseName + "_counter']" );
    var oldCount = parseInt(counter.val());
    var newCount = oldCount - 1;

    // remove a repeat element.
    var repeatDivID =  baseName + '_repeat_' + oldCount;
    jQuery("#" + repeatDivID).remove();

    // decrement counter..
    counter.val ( newCount );
}
                </script>
JS
            },
        ],
    };
};

# modify the formfu method to pull the above specified Repeatable element 
# out and call repeat on it to ensure the element names are uniform 
around 'formfu' => sub {
    my $orig = shift;
    my $self = shift;
    my $formfu =  $self->$orig(@_);
    my $repeatable = $formfu->get_element(
        type => 'Repeatable',
        id   => $self->ref . '_container',
    );
    $repeatable->repeat( $self->_button_count );
    my $hidden = $formfu->get_element(
        type => 'Hidden',
        name => $self->ref . '_counter',
    );
    $hidden->value( $self->_button_count );

    # set the default values again as we have added new elements..
    $formfu->default_values( $self->section_line->params );

    return $formfu;
};

around template_source => sub {
    my $orig = shift;
    my $self = shift;

    my $tt = "<div class='tool_" . $self->ref . "'>";

    foreach ( 1 .. $self->_button_count ) {

        my $label = $self->section_line->params->{ $self->ref . '_label_' . $_ };
        my $sec   = $self->section_line->params->{ $self->ref . '_section_' . $_ };

        $tt .= qq|
        <div>
            <input type="submit" name="[% input_name( 'next_section_button_$_' ) %]" value="$label">
        </div>
        |;

    }
    $tt .= "<div class='tool_" . $self->ref . "_clearer'></div>";
    $tt .= "</div>";

    return $tt;
};

around next_display_section_id => sub {
    my $orig = shift;
    my $self = shift;

    my $next_section_id = $self->$orig(@_);

    my $submitted   = $self->reader->reading->active_read_section->params;
    my $myformvars  = $self->_extract_display_formvars( $submitted );

    foreach ( keys %{ $myformvars } ) {
        if ( $_ =~ /next_section_button_(\d+)/ ) {
            my $number = $1;

            # detected that the next button has been clicked, lets tell the caller
            # which section id to move to
            $next_section_id = $self->section_line->params->{ $self->ref . '_section_' . $number };
        }
    }

    return $next_section_id;

};

around onward_edges => sub {
    my $orig = shift;
    my $self = shift;
    my $edges = $self->$orig(@_);

    if ( $self->section_line->params ) {

        foreach ( 1 .. $self->_button_count ) {

            my $lab = $self->section_line->params->{ $self->ref . '_label_' . $_ };
            my $sec = $self->section_line->params->{ $self->ref . '_section_' . $_ };

            push ( 
                @{ $edges }, 
                {
                    section_id  => $sec,
                    label       => $lab,
                }
            );

        }
    }
    return $edges;
};

has '_button_count' => ( is => 'rw', isa => 'Int', lazy_build => 1 );
sub _build__button_count {
    my $self = shift;
    my $count = 1;
    if ( $self->section_line->params ) {
        foreach ( keys %{ $self->section_line->params } ) {
            if ( $_ =~ /_(\d+)$/ ) {
                $count = $1 if $1 > $count;
            }
        }
    }
    return $count;
}

__PACKAGE__->meta->make_immutable;
1;
