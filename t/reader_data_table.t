
use Modern::Perl;
use FindBin qw($Bin);
use lib "$Bin/lib";
use Test::More;
use FlowellaTest;

ok( my $flowella = FlowellaTest::_get_flowella() );

$flowella->schema->txn_begin;

# Create reading/reader..

ok ( my $reader = Flowella::Reader::DataTable->new(
        flowella    => $flowella,
        params      => { data_table_name => 'Test Data Table' },
    ) );

ok ( my $dt_schema = $reader->schema );
isa_ok( $dt_schema, 'Flowella::Reader::DataTable::Schema' );

$dt_schema->txn_begin;

ok ( my $table = $reader->table );
isa_ok( $table, 'Flowella::Reader::DataTable::Schema::Result::DataTable' );

# Import

cmp_ok( $table->import_csv_file( "$Bin/etc/example.csv" ), '==', 3 );
# .. validate import..
ok( my $row = $table->data_table_rows->find( { row_index => 1 } ) );
is_deeply( 
    { 
        id          => 1, 
        name        => 'Bill Shankley',
        age         => 56,
        sex         => 'm',
        postcode    => 'MK18 3PN',
    }, 
    $row->data_hash 
);

# Searching

ok( my $rows_rs = $table->match_data_rows( { sex => 'm' } ) );
cmp_ok( $rows_rs->count, '==', 2 );

ok( $rows_rs = $table->match_data_rows( { sex => 'm', age => '26' } ) );
cmp_ok( $rows_rs->count, '==', 1 );
cmp_ok( $rows_rs->first->data_hash->{name}, 'eq', 'James Peterson' );

# Reading Row

ok( $row = $table->find_or_create_related('data_table_rows', { reading_id => 1 } ) );
ok( $row->set( name => 'Dobby McFace' ) );
# .. check it returns all the rows (even thou we have not set then) (csv style)
is_deeply( 
    { 
        id          => undef,
        name        => 'Dobby McFace',
        age         => undef,
        sex         => undef,
        postcode    => undef,
    }, 
    $row->data_hash 
);

$dt_schema->txn_rollback;



# Reader functionality

ok ( my $newreading_hr = $flowella->create_reading( { chart_id => 91001 } ) );

# .. it again, but WITH reading_id ..
ok ( $reader = $flowella->get_reader(
        reading_id  => $newreading_hr->{id},
        type        => 'data_table',
        params      => { data_table_name => 'Test Data Table' },
    ) );

$reader->schema->txn_begin;

like ( $reader->display_html, qr|<p> Welcome to the test</p>| );

ok ( $reader->display_process( { '_93003_buttons_next_section_button_1' => 'Click B' } ) );

like ( $reader->display_html, qr|Some test data please| );

ok ( $reader->display_process( { 
            '_93005_textbox_input' => 'test data here',
            '_93006_buttons_next_section_button_1' => 'Click C',
        } ) );

like ( $reader->display_html, qr|Finished B| );

# check we have saved the data we submitted.
ok ( $row = $reader->table->find_related('data_table_rows', { reading_id => $reader->reading->id } ) );
is_deeply ( { test_data_col_a => 'test data here' }, $row->data_hash );


$reader->schema->txn_rollback;

$flowella->schema->txn_rollback;

done_testing();

