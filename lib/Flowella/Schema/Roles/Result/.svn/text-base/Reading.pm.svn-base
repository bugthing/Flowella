package Flowella::Schema::Roles::Result::Reading;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;

=head1 NAME

Flowella::Schema::Roles::Result::Reading - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::Reading->load_components( "TimeStamp" );
Flowella::Schema::Result::Reading->add_columns(
    "added",
    {
      data_type     => "timestamp", default_value => \"current_timestamp",
      is_nullable   => 0, set_on_create => 1, set_on_update => 0 
    },
    "updated",
    {
      data_type     => "timestamp", default_value => \"current_timestamp",
      is_nullable   => 0, set_on_create => 1, set_on_update => 1 
    },
);   

=head1 ATTRIBUTES

=over

=item stash

Used to store stuff when processing a reading. Used by the tools to place data
in for pre/post section process of data.

=cut

# not sure why this has to be lazy in order to work, but it does! :(
has 'stash' => ( is => 'ro', isa => 'HashRef', default => sub{{}}, lazy => 1 );

=back 

=head1 MODIFIED METHODS

=over

=item insert

Insure that newly created Reading starts with a default ReadSection that
starts on the starting section of the linked Chart.

=cut

around insert => sub {
    my ($orig, $self) = (shift, shift);
    my @args = @_;

    my $guard = $self->result_source->schema->txn_scope_guard;
    $self->$orig(@args);
    my $read_section = $self->create_related ('read_sections', {} );
    $self->active_read_section( $read_section );
    $self->update();
    $guard->commit;

    return $self;
};

=back

=cut

1;
