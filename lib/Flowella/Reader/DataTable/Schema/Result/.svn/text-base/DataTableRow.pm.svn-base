package Flowella::Reader::DataTable::Schema::Result::DataTableRow;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 NAME

Flowella::Reader::DataTable::Schema::Result::DataTableRow

=cut

__PACKAGE__->table("data_table_rows");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 data_table_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 reading_id

  data_type: 'integer'
  is_nullable: 1

=head2 row_index

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
  "data_table_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "reading_id",
  { data_type => "integer", is_nullable => 1 },
  "row_index",
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
  "data_table_id_row_index_unique",
  ["data_table_id", "row_index"],
);

=head1 RELATIONS

=head2 data_table

Type: belongs_to

Related object: L<Flowella::Reader::DataTable::Schema::Result::DataTable>

=cut

__PACKAGE__->belongs_to(
  "data_table",
  "Flowella::Reader::DataTable::Schema::Result::DataTable",
  { id => "data_table_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);

=head2 data_table_cols

Type: has_many

Related object: L<Flowella::Reader::DataTable::Schema::Result::DataTableCol>

=cut

__PACKAGE__->has_many(
  "data_table_cols",
  "Flowella::Reader::DataTable::Schema::Result::DataTableCol",
  { "foreign.data_table_row_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07010 @ 2011-12-22 12:50:20
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:CQ6hMmgTMpY+/nLiCLkd7A

# ABSTRACT: Flowchart creator, manager and runner.

__PACKAGE__->load_components(
    'DynamicDefault',
);
__PACKAGE__->add_columns(
    "row_index",
    {  
        data_type                   => "integer",
        is_nullable                 => 0,
        dynamic_default_on_create   => \&row_index_dynamic_default_on_create
    },
);

=head1 METHODS

=over 

=item row_index_dynamic_default_on_create

Provides a default for the row_index.

=cut

sub row_index_dynamic_default_on_create {
    my $self = shift;
    my $ri = $self->data_table->data_table_rows->get_column('row_index')->max();
    $ri ||= 0;
    return ( $ri + 1 );
}

=item data_hash

Get all columns and data, places in a hash and returns.

=cut

sub data_hash {
    my $self = shift;

    my $hr = {};
    my $rs = $self->data_table_cols;
    while( my $col = $rs->next ) {
        $hr->{ $col->column_name } = $col->column_data;
    } 

    # ensure we have all the possible columns
    for ( @{ $self->column_names } ) {
        next unless length($_);
        $hr->{$_} = undef unless exists $hr->{$_};
    }

    return $hr;
}

=item column_names

Get all columns names from the data table.

=cut

sub column_names {
    my $self = shift;

    my @col_names = $self->data_table->search_related( 
        'data_table_rows', 
        {},  
        {  
            join        => 'data_table_cols', 
            select      => [ 'data_table_cols.column_name' ], 
            as          => [ 'column_name' ], 
            distinct    => 1 ,
        }
    )->get_column('column_name')->all;

    return \@col_names;
}

=item set( $column_name, $column_value )

Set a value in under a column name. 

=cut

sub set {
    my $self = shift;
    my ( $col_name, $col_value ) = @_;
    my $col = $self->data_table_cols->find_or_create(
        {
            column_name => $col_name,
            column_data => $col_value,
        },
    );
    $col->column_data( $col_value );
    $col->update;
}

=back

=cut

1;
