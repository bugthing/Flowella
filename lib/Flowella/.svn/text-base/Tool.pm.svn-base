package Flowella::Tool;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
use MooseX::ClassAttribute;

=head1 NAME

Flowella::Tool - Base class for a Flowella Tool

=cut

class_has 'ref'     => ( is => 'rw', isa => 'Str', default => '' );
class_has 'name'    => ( is => 'rw', isa => 'Str', default => '' );

has 'section_line'  => ( is => 'ro', isa => 'Maybe[Flowella::Schema::Result::SectionLine]' );
has 'reader'        => ( is => 'ro', isa => 'Maybe[Object]' );

has 'edit_html'                 => ( is => 'rw', isa => 'Str', default => '' );
has 'display_html'              => ( is => 'rw', isa => 'Str', default => '' );

has 'is_edit_ok'                => ( is => 'rw', isa => 'Bool', default => 1 );
has 'is_display_ok'             => ( is => 'rw', isa => 'Bool', default => 1 );

has 'onward_edges'              => ( is => 'ro', isa => 'ArrayRef', default => sub{[]} );
has 'next_display_section_id'   => ( is => 'rw', isa => 'Int', default => 0 );

__PACKAGE__->meta->make_immutable;
1;
