package Flowella::Reader::DataTable::Schema::Result::DataTable;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

use strict;
use warnings;

use base 'DBIx::Class::Core';

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 NAME

Flowella::Reader::DataTable::Schema::Result::DataTable

=cut

__PACKAGE__->table("data_tables");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 name

  data_type: 'varchar'
  is_nullable: 0
  size: 25

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
  "name",
  { data_type => "varchar", is_nullable => 0, size => 25 },
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
__PACKAGE__->add_unique_constraint("name_unique", ["name"]);

=head1 RELATIONS

=head2 data_table_rows

Type: has_many

Related object: L<Flowella::Reader::DataTable::Schema::Result::DataTableRow>

=cut

__PACKAGE__->has_many(
  "data_table_rows",
  "Flowella::Reader::DataTable::Schema::Result::DataTableRow",
  { "foreign.data_table_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07010 @ 2011-12-22 12:50:20
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:8avPTeVCVEf5m61K7qvGJg

# ABSTRACT: Flowchart creator, manager and runner.

use Text::CSV_XS;

=head1 METHODS

=over

=item match_data_rows( $search_hash )

Pulls out all the rows that match the colum and data in the passed in hash.

=cut

sub match_data_rows {
    my $self = shift;
    my ( $match_these ) = @_;

    my %found_ids;
    for ( keys %$match_these ) {

        my @row_ids = $self->data_table_rows->search(
            {
                'data_table_cols.column_name' => $_,
                'data_table_cols.column_data' => $match_these->{$_},
            },
            {
                join        => 'data_table_cols',
                columns     => ['id'],
            },
        )->get_column('id')->all;

        $found_ids{$_}++ for ( @row_ids );
    }

    my @ids = grep { $found_ids{$_} == scalar keys %$match_these } keys %found_ids;

    return $self->data_table_rows->search( { id => { in => \@ids } } );
}


=item import_csv_file

Import a CSV file into the table structure.

=cut

sub import_csv_file {
    my $self = shift;
    my ( $file ) = @_;

    my $csv = Text::CSV_XS->new ({ binary => 1 }) or
        die "Cannot use CSV: ". Text::CSV_XS->error_diag ();

    open my $fh, "<:encoding(utf8)", $file or die "$file: $!";

    my $header_row = $csv->getline($fh);

    my $row_index = $self->data_table_rows->count;
    my $added_rows = 0;
    while (my $data_row = $csv->getline($fh)) {

        # create a csv row..
        my $csv_row = $self->find_or_create_related('data_table_rows', { row_index => ++$row_index } );

        # now add each column of the source data to the csv_row..
        for( my $i = 0; $i <= $#$header_row; $i++ ) {

            my $col = $csv_row->set( $header_row->[$i] => $data_row->[$i] );
        }

        $added_rows++;
    }

    $csv->eof or $csv->error_diag();

    close $fh;

    return $added_rows;
}

=back

=cut

# You can replace this text with custom code or comments, and it will be preserved on regeneration
1;
