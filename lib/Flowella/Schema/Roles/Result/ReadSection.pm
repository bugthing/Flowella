package Flowella::Schema::Roles::Result::ReadSection;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;

=head1 NAME

Flowella::Schema::Roles::Result::ReadSection - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::ReadSection->load_components(
    'DynamicDefault',
    'InflateColumn::Serializer',
    'TimeStamp',
);
Flowella::Schema::Result::ReadSection->add_columns(
    "section_id",
    {  
        data_type => "integer", is_foreign_key => 1, is_nullable => 1,
        dynamic_default_on_create   => \&section_id_dynamic_default_on_create
    },
    'params' => {
        'data_type'         => 'blob',
        'serializer_class'  => 'JSON',
    },
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

=head1 METHODS

=over

=item section_id_dynamic_default_on_create

Returns the default for section_id. The starting_section of the linked Chart

=cut

sub section_id_dynamic_default_on_create {
    my $self = shift;
    return $self->reading->chart->starting_section->id;
}

=back

=cut

1;
