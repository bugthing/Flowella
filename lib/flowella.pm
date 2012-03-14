package Flowella;

# ABSTRACT: This is a bugthing web project
our $VERSION = '0.1';
use Dancer ':syntax';

=head1 NAME

Flowella - A bugthing project

=head1 DESCRIPTION

Dancer web application for bugthing.

=head1 ROUTES

=over

=item get / 

Root for web that outputs index.html

=cut

get '/' => sub {
    Dancer::FileUtils::read_file_content('public/index.html');
};

=item get * 

The catch all route to display templates

=cut

get qr{/(?<loadtemplate>\w*)(/)?$}x => sub {
    template (captures->{loadtemplate} || 'index')
};

=back

=cut

1;
