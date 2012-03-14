package Flowella::Tool::Text;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;

extends 'Flowella::Tool';

with 'Flowella::Tool::Roles::FormFuEdit';
with 'Flowella::Tool::Roles::TemplateToolkitDisplay';

around 'ref'    => sub { 'text' };
around 'name'   => sub { 'Text' };

has 'formfu_config' => ( is => 'ro', isa => 'HashRef', default => sub {
    {  
        elements => [
            {  
                type    => 'Textarea',
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

    <div class='tool_text'>
    <p> [% section_line.params.display_text %]</p>
    </div>

    |;

    return $tt;
};


__PACKAGE__->meta->make_immutable;
1;
