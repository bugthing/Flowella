
use Modern::Perl;
use FindBin qw($Bin);
use lib "$Bin/lib";
use Test::More;
use FlowellaTest;

ok( my $schema      = FlowellaTest::_get_schema() );

$schema->txn_begin; 

# create chart
ok( my $chart_rs    = $schema->resultset('Chart') );
ok( my $chart       = $chart_rs->find_or_create({ name => 'Test Chart' }) );
# .. check relations..
ok( $chart->sections );

# create some sections linked to the chart
ok( my $section_rs  = $chart->sections );
ok( my $section1    = $section_rs->find_or_create({ name => 'Section 1' }) );
ok( my $section2    = $section_rs->find_or_create({ name => 'Section 2' }) );
ok( my $section3    = $section_rs->find_or_create({ name => 'Section 3' }) );
ok( my $section4    = $section_rs->find_or_create({ name => 'Section 4' }) );
# .. check relations..
ok( $section1->chart );
ok( $section1->section_lines );

# create some section lines linked to the sections
ok( my $section_line1 = $section1->section_lines->create( { tool_ref => 'text_box' } ) );
ok( my $section_line2 = $section1->section_lines->create( { tool_ref => 'button_next' } ) );
ok( my $section_line3 = $section1->section_lines->create( { tool_ref => 'button_next' } ) );
ok( my $section_line4 = $section2->section_lines->create( { tool_ref => 'button_next' } ) );
ok( my $section_line5 = $section3->section_lines->create( { tool_ref => 'text' } ) );
ok( my $section_line6 = $section4->section_lines->create( { tool_ref => 'text' } ) );
# .. check relations..
ok( $section_line1->section );

# create reading
ok( my $reading_rs  = $schema->resultset('Reading') );
ok( my $reading     = $reading_rs->create({ chart_id => $chart->id }) );
# .. check relations..
ok( $reading->chart );

# check we get a default active read section and its the 1st section
ok( $reading->read_sections );
ok( $reading->active_read_section );
cmp_ok( $reading->active_read_section->section->id, '==', $section1->id );

$schema->txn_rollback;

done_testing();

