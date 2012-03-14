package flowella;
# ABSTRACT: Flowchart creator, manager and runner.

our $VERSION = '0.1';
use Dancer ':syntax';

use flowella::rest::build;
use flowella::rest::read;

use Dancer::Plugin::Auth::Basic;

prefix undef;

=head1 NAME

flowella - system to give web UI to Flowella

=head1 DESCRIPTION

Dancer web application for Flowella.

=head1 ROUTES

=over

=item get * 

The catch all route to display templates

=cut

get qr{
    / (?<loadtemplate> \w* )
   (/)?$
}x => sub {
    my $value_for = captures;
    my $template  = $value_for->{loadtemplate} || 'index';
    template $template;
};

=back

=cut

1;
