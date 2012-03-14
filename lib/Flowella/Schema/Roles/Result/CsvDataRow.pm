package Flowella::Schema::Roles::Result::CsvDataRow;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;

=head1 NAME

Flowella::Schema::Roles::Result::CsvDataRow - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::CsvDataRow->load_components(
    'DynamicDefault','TimeStamp',
);
Flowella::Schema::Result::CsvDataRow->add_columns(
    "row_index",
    {  
        data_type                   => "integer",
        is_nullable                 => 0,
        dynamic_default_on_create   => \&row_index_dynamic_default_on_create
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

=item row_index_dynamic_default_on_create

Provides a default for the row_index.

=cut

sub row_index_dynamic_default_on_create {
    my $self = shift;
    my $ri = $self->processor->csv_data_rows->get_column('row_index')->max();
    $ri ||= 0;
    return ( $ri + 1 );
}

=item data_hash

Get all columns and data, places in a hash and returns.

=cut

sub data_hash {
    my $self = shift;

    my $hr = {};
    my $rs = $self->csv_data_cols;
    while( my $col = $rs->next ) {
        $hr->{ $col->column_name } = $col->column_data;
    } 

    # ensure we have all the possible columns
    for ( @{ $self->column_names } ) {
        $hr->{$_} = undef unless exists $hr->{$_};
    }

    return $hr;
}

=item column_names

Get all columns names from the csv.

=cut

sub column_names {
    my $self = shift;

    my @col_names = $self->processor->search_related( 
        'csv_data_rows', 
        {},  
        {  
            join        => 'csv_data_cols', 
            select      => [ 'csv_data_cols.column_name' ], 
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
    my $col = $self->csv_data_cols->find_or_create(
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
