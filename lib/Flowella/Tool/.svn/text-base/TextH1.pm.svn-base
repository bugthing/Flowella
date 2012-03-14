package Flowella::Tool::TextH1;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;

extends 'Flowella::Tool::Text';

around 'ref'    => sub { 'texth1' };
around 'name'   => sub { 'Text Heading' };

has 'formfu_config' => ( is => 'ro', isa => 'HashRef', default => sub {
    {  
        elements => [
            {  
                type    => 'Text',
                name    => 'display_text',
                label   => 'Display Text',
            },
        ],
    };
});

around template_source => sub {
    my $orig = shift;
    my $self = shift;

    my $tt = q|

    <div class='tool_texth1'>
    <h1> [% section_line.params.display_text %]</h1>
    </div>

    |;

    return $tt;
};


__PACKAGE__->meta->make_immutable;
1;
