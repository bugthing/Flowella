package Flowella::Reader::DataTable::Schema::Result::DataTableCol;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 NAME

Flowella::Reader::DataTable::Schema::Result::DataTableCol

=cut

__PACKAGE__->table("data_table_cols");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 data_table_row_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 column_name

  data_type: 'varchar'
  is_nullable: 0
  size: 50

=head2 column_data

  data_type: 'blob'
  is_nullable: 0

=head2 column_index

  data_type: 'integer'
  is_nullable: 0

=head2 added

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=head2 updated

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=cut

__PACKAGE__->add_columns(
  "id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "data_table_row_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "column_name",
  { data_type => "varchar", is_nullable => 0, size => 50 },
  "column_data",
  { data_type => "blob", is_nullable => 0 },
  "column_index",
  { data_type => "integer", is_nullable => 0 },
  "added",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
  },
  "updated",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
  },
);
__PACKAGE__->set_primary_key("id");
__PACKAGE__->add_unique_constraint(
  "data_table_row_id_column_name_unique",
  ["data_table_row_id", "column_name"],
);

=head1 RELATIONS

=head2 data_table_row

Type: belongs_to

Related object: L<Flowella::Reader::DataTable::Schema::Result::DataTableRow>

=cut

__PACKAGE__->belongs_to(
  "data_table_row",
  "Flowella::Reader::DataTable::Schema::Result::DataTableRow",
  { id => "data_table_row_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);


# Created by DBIx::Class::Schema::Loader v0.07010 @ 2011-12-22 12:50:20
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:b+lkIzlBQ21/UYG7saMxsA

# ABSTRACT: Flowchart creator, manager and runner.

__PACKAGE__->load_components(
    'DynamicDefault',
);
__PACKAGE__->add_columns(
    "column_index",
    {  
        data_type                   => "integer",
        is_nullable                 => 0,
        dynamic_default_on_create   => \&column_index_dynamic_default_on_create
    },
);

=head1 METHODS

=over 

=item column_index_dynamic_default_on_create

Provides a default for the column_index.

=cut

sub column_index_dynamic_default_on_create {
    my $self = shift;
    my $ci = $self->data_table_row->data_table_cols->get_column('column_index')->max();
    $ci ||= 0;
    return ( $ci + 1 );
}

1;
