
use Modern::Perl;
use FindBin qw($Bin);
use lib "$Bin/lib";
use Test::More;
use FlowellaTest;
use Flowella;

ok( my $flowella    = Flowella->new( dsn => $FlowellaTest::DB_DSN ) );

$flowella->schema->txn_begin;

# dynamic tool loading

ok( my $tools_ra    = $flowella->_tool_classes );
is_deeply( 
    [ 
        'Flowella::Tool::ButtonsNext', 
        'Flowella::Tool::Text', 
        'Flowella::Tool::TextBox', 
        'Flowella::Tool::TextH1', 
    ], 
    $tools_ra,
);

# dynamic reader loading

ok( my $readers_ra  = $flowella->_reader_classes );
is_deeply( 
    [ 
        'Flowella::Reader::DataTable',
    ], 
    $readers_ra,
);

# test the schema has been give the list of tools
is_deeply( 
    {
        text         => 'Flowella::Tool::Text',
        text_box     => 'Flowella::Tool::TextBox',
        texth1       => 'Flowella::Tool::TextH1',
        buttons_next => 'Flowella::Tool::ButtonsNext',
    },
    $flowella->schema->available_tool_classes,
);

# test the schema has been give the list of readers
is_deeply( 
    {
        data_table => 'Flowella::Reader::DataTable',
    },
    $flowella->schema->available_reader_classes,
);


# test reading

ok ( my $newreading_hr = $flowella->create_reading( { chart_id => 91001 } ) );

ok ( my $reader = $flowella->get_reader( 
        reading_id  => $newreading_hr->{id}, 
        type        => 'data_table',
        params      => { data_table_name => 'Test Data Table' },
    ) );

$reader->schema->txn_begin;

like ( $reader->display_html, qr|<p> Welcome to the test</p>| );

ok ( $reader->display_process( { '_93002_next_section_button_1' => 'Click A' } ) );

like ( $reader->display_html, qr|<p> Finished A</p>| );

$reader->schema->txn_rollback;
$flowella->schema->txn_rollback;

done_testing();
