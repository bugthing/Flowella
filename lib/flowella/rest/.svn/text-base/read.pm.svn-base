package flowella::rest::read;
# ABSTRACT: Flowchart creator, manager and runner.

# dancer

use Dancer;
use Dancer::Plugin::REST;
use Flowella;
prefix '/rest/read';
set serializer => 'JSON';

my $flowella    = Flowella->new( dsn => config->{flowella}->{dsn} );

# allow REST API to my accessed from outside this application.
hook before => sub {
    header 'access_control_allow_origin' => '*';
};

=head1 NAME

flowella::rest::read - REST API for reading a Flowella chart.

=head1 DESCRIPTION

A REST API to read a Flowella chart.

=head1 ROUTES

=cut

options qr{/.+?} => sub {
    header 'access_control_allow_methods' => "POST, GET, OPTIONS, PUT, DELETE";
};

get '/charts' => sub {
    status_ok( $flowella->get_charts );
};

get '/readings' => sub {
    status_ok( $flowella->get_readings );
};

=head2 REST - Reading

=cut

resource reading =>
    'get'       => \&on_get_reading,
    'create'    => \&on_create_reading,
    'update'    => \&on_update_reading,
    'delete'    => sub {},
;

sub on_get_reading {
    status_ok( $flowella->get_reading_by_id( params->{id} ) );
}
sub on_create_reading {
    my $data = params;
    status_created( $flowella->create_reading( $data ) );
}
sub on_update_reading {
    my $data = params;
    status_accepted( $flowella->update_reading( $data ) );
}

=over

=back

=cut
1;
