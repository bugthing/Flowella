package Flowella::Tool::Roles::FormFuEdit;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;
use HTML::FormFu;

=head1 NAME

Flowella::Tool::Roles::FormFuEdit - FormFu enabled editing for Tools

=cut

has 'formfu_config'     => ( is => 'ro', isa => 'Maybe[HashRef]' );

has 'formfu'            => ( is => 'ro', isa => 'Maybe[HTML::FormFu]', lazy => 1, default => sub {
    my $self = shift;
    if ( defined $self->formfu_config ) {
        my $form = HTML::FormFu->new( $self->formfu_config );
        $form->default_values( $self->section_line->params );
        return $form;
    }
    return;
});

# arrayref of arrayrefs for populating selectbox of sections.
has section_select_options => ( is => 'ro', isa => 'ArrayRef', lazy => 1, default => sub {
    my $self = shift;

    my $selectbox_options = [];
    if ( my $section_line = $self->section_line ) {

        my @sections = $section_line->section->chart->sections;

        foreach my $section ( @sections ) {
            push ( @$selectbox_options, [ $section->id, $section->name ] );
        }

    }
    return $selectbox_options;
} );

around 'edit_html'  => sub {
    my $orig = shift;
    my $self = shift;

    my $html = $self->$orig(@_);

    if ( ! @_ && defined $self->formfu ) {
        $html = $self->formfu->render;
    }

    return $html;
};

around 'is_edit_ok' => sub {
    my $orig = shift;
    my $self = shift;

    my $ok = $self->$orig(@_);

    if ( $self->formfu ) {
        $self->formfu->process( $self->section_line->params );
        if ( $self->formfu->submitted_and_valid ) {
            $ok = 1; # it went ok
        }
        else {
            # bad form data, so not ok and also set edit_html if form + errors
            $ok = 0; 
            $self->edit_html( $self->formfu->render );
        }
    }

    return $ok;
};

=back

=cut

1;
