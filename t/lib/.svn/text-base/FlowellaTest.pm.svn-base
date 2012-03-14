package FlowellaTest;

use Readonly;
use Flowella;

Readonly::Scalar    our $DB_DSN => 'dbi:SQLite:dbname=./t/etc/db/flowella.db';

sub _get_flowella {
    my $flowella = Flowella->new( dsn => $DB_DSN);
    return $flowella;
}

sub _get_schema {
    my $flowella = _get_flowella();
    my $schema = $flowella->schema;
    return $schema;
}

1;
