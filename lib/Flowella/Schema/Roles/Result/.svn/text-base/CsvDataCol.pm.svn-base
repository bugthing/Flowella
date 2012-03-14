package Flowella::Schema::Roles::Result::CsvDataCol;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;

=head1 NAME

Flowella::Schema::Roles::Result::CsvDataCol - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::CsvDataCol->load_components(
    'DynamicDefault', 'TimeStamp',
);
Flowella::Schema::Result::CsvDataCol->add_columns(
    "column_index",
    {  
        data_type                   => "integer",
        is_nullable                 => 0,
        dynamic_default_on_create   => \&column_index_dynamic_default_on_create
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

=item column_index_dynamic_default_on_create

Provides a default for the column_index.

=cut

sub column_index_dynamic_default_on_create {
    my $self = shift;
    my $ci = $self->csv_data_row->csv_data_cols->get_column('column_index')->max();
    $ci ||= 0;
    return ( $ci + 1 );
}

1;
