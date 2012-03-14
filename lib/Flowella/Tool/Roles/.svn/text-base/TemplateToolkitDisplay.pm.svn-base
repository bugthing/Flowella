package Flowella::Tool::Roles::TemplateToolkitDisplay;
# ABSTRACT: Flowchart creator, manager and runner.#

use Moose::Role;
use Template;

=head1 NAME

Flowella::Tool::Roles::TemplateToolkitDisplay - TT enabled display for Tools

=cut

has 'template_source'   => ( is => 'ro', isa => 'Maybe[Str]' );
has 'template_toolkit'  => ( is => 'ro', isa => 'Maybe[Template]', lazy_build => 1 );
has 'template_vars'     => ( is => 'ro', isa => 'Maybe[HashRef]', lazy_build => 1 );

around 'display_html'  => sub {
    my $orig = shift;
    my $self = shift;

    my $html = $self->$orig(@_);

    # if we are NOT setting and we have template_toolkit object, build the 
    # display HTML by using template toolkit
    if ( ! @_ && defined $self->template_toolkit ) {

        my $tt = $self->template_source;
        my $tt_out = '';

        my $rendered = $self->template_toolkit->process(
            \$tt,
            $self->template_vars,
            \$tt_out
        ) or die $self->template_source->error();

        $html = $tt_out;
    }

    return $html;
};

sub _build_template_toolkit {
    my $self = shift;
    if ( defined $self->template_source ) {
        my $template_toolkit  = Template->new();
        return $template_toolkit;
    }
    return;
}

sub _build_template_vars {
    my $self = shift;
    my $vars;
    $vars->{section_line}   = $self->section_line if $self->section_line;
    $vars->{reader}         = $self->reader if $self->reader;
    $vars->{input_name}     = sub { my ($name) = @_; return $self->_build_display_inputname($name); };
    return $vars;
}

sub _build_display_inputname {
    my $self = shift;
    my ( $name ) = @_;
    return '_' . $self->section_line->id . '_' . $name;
}

sub _extract_display_formvars {
    my $self = shift;
    my ( $all_formvars ) = @_;
    my $extracted_formvars;
    my $section_line_id = $self->section_line->id;
    map {
        if ( $_ =~ /^_\Q$section_line_id\E_(.+?)$/ ) {
            $extracted_formvars->{$1} = $all_formvars->{$_};
        }
    } keys %$all_formvars;

    return $extracted_formvars;
}

=back

=cut

1;
