package Flowella::Reader;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
use MooseX::ClassAttribute;

=head1 NAME

Flowella::Reader - Base class to provide interface for Readers in Flowella.

=cut

=head1 ATTRIBUTES

=over

=item ref

CLASS ATTRIBUTE.
Used to hold the reference string to this reader so we can refer to easily.

=cut

class_has 'ref'     => ( is => 'rw', isa => 'Str', default => 'base' );

=item reading_id

The ID of the reading this reader will read.

=cut

has 'reading_id'    => ( is => 'ro', isa => 'Int' );

=item flowella

Object of the top level Flowella object this Reader is part of.

=cut

has 'flowella'      => ( is => 'ro', isa => 'Flowella', required => 1 );

=item flowella

HashRef. To get data in/out of section lines when reading a section

=cut

has 'stash'         => ( is => 'ro', isa => 'HashRef', default => sub{{}} );

=item params

HashRef. Reader specific data in here. For example, which table to get data from.

=cut

has 'params'        => ( is => 'ro', isa => 'HashRef', default => sub{{}} );

=item reading

Used internally to reference the Reading this Reader is reading.

=cut

has 'reading'       => ( is => 'ro', isa => 'Flowella::Schema::Result::Reading', lazy_build => 1 );
sub _build_reading {
    my $self = shift;
    carp("Reading requested but no reading_id supplied") unless $self->reading_id;
    return $self->flowella->schema->resultset('Reading')->find( $self->reading_id );
}

=back

=head1 METHODS

=over

=item display_html

Checks with each the Section SectionLines to collect and return a HTML string.

=cut

sub display_html {
    my $self = shift;

    my $html='';
    my $section_lines_rs = $self->reading->active_read_section->section->section_lines;
    while ( my $section_line = $section_lines_rs->next ) {

        $html .= $section_line->tool( reader => $self )->display_html;

    }

    return $html;
}

=item display_process( $form_data )

Process submitted data after a display submission

Args: hashref - Form Data 
Returns: boolean (success or failed)

=cut

sub display_process {
    my $self = shift;

    my ( $form_data ) = @_;

    $self->reading->active_read_section->params( $form_data );
    $self->reading->active_read_section->update();

    my $before_section_id = $self->reading->active_read_section->section->id;
    my $next_section_id;
    my $has_error;

    my $section_lines_rs = $self->reading->active_read_section->section->section_lines;
    while ( my $section_line = $section_lines_rs->next ) {

        my $tool_object = $section_line->tool( reader => $self );
        if ( $tool_object->is_display_ok ) {

            # read of section went ok
            $next_section_id = $tool_object->next_display_section_id 
                if ( $tool_object->next_display_section_id );
        }
        else {
            # read of section failed
            $has_error = 1;
        }
    }

    # can we moved on? if so, create a new read_section and mark that as active
    if ( ! $has_error && defined $next_section_id && $before_section_id != $next_section_id ) {

        my $read_section = $self->reading->create_related( 'read_sections', { section_id => $next_section_id } );
        $self->reading->active_read_section( $read_section );
        $self->reading->update();

        return 1;
    }

    return 0;
}

=back

=cut

__PACKAGE__->meta->make_immutable;
1;
