
use Modern::Perl;
use FindBin qw($Bin);
use lib "$Bin/lib";
use Test::More;


BEGIN { 
    use_ok( 'Flowella::Tool' ); 
    use_ok( 'Flowella::Tool::Text' ); 
    use_ok( 'Flowella::Tool::TextBox' ); 
    use_ok( 'Flowella::Tool::ButtonNext' ); 
}

my $text    = new_ok( "Flowella::Tool::Text");
my $textbox = new_ok( "Flowella::Tool::TextBox");
my $button  = new_ok( "Flowella::Tool::ButtonNext");

diag( $textbox->edit_html );


done_testing();
