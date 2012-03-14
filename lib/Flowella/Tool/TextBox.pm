package Flowella::Tool::TextBox;

# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
extends 'Flowella::Tool';
with 'Flowella::Tool::Roles::FormFuEdit';
with 'Flowella::Tool::Roles::TemplateToolkitDisplay';

around 'ref'    => sub { 'text_box' };
around 'name'   => sub { 'Text Box' };

has 'formfu_config' => ( is => 'ro', isa => 'HashRef', default => sub {
    {
        elements => [
            {
                type        => 'Text',
                name        => 'data_column',
                label       => 'Data Column Name',
                constraints => { type => 'Required' },

            },
            {
                type    => 'Text',
                name    => 'display_text',
                label   => 'Display Text',
            },
        ],
    };
});

around template_source => sub {
    my $orig = shift;
    my $self = shift;

    # see if we can get value out from stash.
    my $value = $self->reader->stash->{data}->{
        $self->section_line->params->{data_column} 
    } if exists $self->reader->stash->{data};
    $value = '' unless defined $value;

    my $tt = qq|

    <div class='tool_text_box'>
    <p> Data to go into: [% section_line.params.data_column %]</p>
    <p> [% section_line.params.display_text %]</p>
    <input type="text" name="[% input_name( 'textbox_input' ) %]" value="$value">
    </div>

    |;

    return $tt;
};

around is_display_ok => sub {
    my $orig = shift;
    my $self = shift;

    my $next_section_id = $self->$orig(@_);

    my $submitted   = $self->reader->reading->active_read_section->params;
    my $myformvars  = $self->_extract_display_formvars( $submitted );

    if ( exists $myformvars->{'textbox_input'} ) {

        # save the value into the reading stash's 'data' hashkey.
        $self->reader->stash->{data}->{
            $self->section_line->params->{data_column} 
        } = $myformvars->{'textbox_input'};

    }

    return 1;
};

__PACKAGE__->meta->make_immutable;
1;
