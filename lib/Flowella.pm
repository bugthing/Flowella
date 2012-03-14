package Flowella;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
use Class::MOP;
use Module::Pluggable::Object;
use Flowella::Schema;

=head1 NAME

Flowella - Flow chart based process management.

=head1 ATTRIBUTES

=over

=cut

has 'dsn'       => ( is => 'ro', isa => 'Str', required => 1 );
has 'user'      => ( is => 'ro', isa => 'Str', );
has 'pass'      => ( is => 'ro', isa => 'Str', );

has 'schema'    => ( is => 'ro', isa => 'Flowella::Schema', lazy_build => 1 );
sub _build_schema {
    my $self = shift;
    return Flowella::Schema->connect(
        $self->dsn,
        $self->user,
        $self->pass,
    );
}

=item tool_namespaces

ArrayRef. Name spaces to search and load as tools for building Flowella charts

=cut

has 'tool_namespaces'   => ( is => 'ro', isa => 'ArrayRef', default => sub{['Flowella::Tool']} );
has '_tool_classes'     => ( is => 'ro', isa => 'ArrayRef', lazy_build => 1 );
sub _build__tool_classes {
    my $self = shift;
    $self->_load_and_return_classes( $self->tool_namespaces );
}
has '_tool_classes_hr'  => ( is => 'ro', isa => 'HashRef', lazy_build => 1 );
sub _build__tool_classes_hr {
    my $self = shift;
    return { map { $_->ref => $_ } @{ $self->_tool_classes } };
}

=item reader_namespaces

ArrayRef. Name spaces to search and load as readers of Flowella charts

=cut

has 'reader_namespaces'   => ( is => 'ro', isa => 'ArrayRef', default => sub{['Flowella::Reader']} );
has '_reader_classes'     => ( is => 'ro', isa => 'ArrayRef', lazy_build => 1 );
sub _build__reader_classes {
    my $self = shift;
    $self->_load_and_return_classes( $self->reader_namespaces );
}
has '_reader_classes_hr'  => ( is => 'ro', isa => 'HashRef', lazy_build => 1 );
sub _build__reader_classes_hr {
    my $self = shift;
    return { map { $_->ref => $_ } @{ $self->_reader_classes } };
}

=back

=head1 METHODS

=over

=item BUILD

=cut

sub BUILD {
    my $self = shift;

    # populate the schema with pluggable things we know about.

    # .. tools ..
    $self->schema->available_tool_classes( $self->_tool_classes_hr );

    # .. readers ..
    $self->schema->available_reader_classes( $self->_reader_classes_hr );
}

=item _load_and_return_classes( $search_path )

Finds and loads classes specified in the search path passed in.

Any classes without a class method named 'ref' are ignored.

B<Paramters>

$search_path    - String or ArrayRef. The path to use when searching for
classes to load and return. (e.g. ['Flowella::Tool', 'My::Tools'] )

B<Returns>

ArrayRef        - An array of class names that have been found and loaded.

=cut

sub _load_and_return_classes {
    my $self = shift;
    my ( $search_path ) = @_;
    my $locator = Module::Pluggable::Object->new( search_path => $search_path );
    my @classes;
    for my $class ( $locator->plugins ) {

        eval { Class::MOP::load_class($class) };

        if ( $@ ) {
            confess("Failed to load class: $class - $@");
            next;
        }

        # here we exclude modules that do not have a class method named 'ref'
        next unless defined $class->can('ref');

        push( @classes, $class );
    }
    return [ sort @classes ];
}

=item get_reader ( reading_id => $id, type => $type, params => $hr )

Instanciated and returns a Reader depending on type passed in.

=cut

sub get_reader {
    my $self = shift;

    my %args = @_;

    # find the reader from the type..
    my $type = ( exists $args{type} ? $args{type} : 'base' );
    my ($reader_class) = grep { $_->ref eq $args{type} } @{ $self->_reader_classes };

    croak ("could not find Reader class from: $type " ) unless $reader_class;

    my $params = ( exists $args{params} ? $args{params} : {} );

    my $reading = $reader_class->new( 
        flowella    => $self,
        reading_id  => $args{reading_id},
        params      => $params,
    );
}

=back






=head1 METHODS - Supporting REST 

Below this point the method are directly related the REST API and back the 
methods exposed via Dancer.

=cut


sub get_charts {
    my $self = shift;
    my $rs = $self->schema->resultset('Chart');
    $rs->result_class('DBIx::Class::ResultClass::HashRefInflator');
    return [ $rs->all ];
}

sub get_readings {
    my $self = shift;
    my $rs = $self->schema->resultset('Reading');
    $rs = $rs->search({}, { join => 'chart' } );
    my $json = [];
    while ( my $r = $rs->next ) { 
        push ( 
            @$json,
            { 
                id       => $r->id,
                added    => $r->added . '', # force str context
                updated  => $r->updated . '', # force str context
                chart_id => $r->chart_id,
                chart    => { name => $r->chart->name },
            } 
        );
    }
    return $json;
}

sub get_tools {
    my $self = shift;
    return [ 
        map { 
            { 
                ref     => $_->ref, 
                name    => $_->name,
                class   => $_,
            } 
        } @{ $self->_tool_classes } 
    ];
}

sub get_chart_by_id {
    my $self = shift;
    my ( $id ) = @_;

    my $chart = $self->schema->resultset('Chart')->find( $id );

    return {
        id          => $chart->id,
        name        => $chart->name,
        edges       => $chart->edges,
        sections    => [ map { { 
            id          => $_->id, 
            name        => $_->name,
            pos_left    => $_->pos_left,
            pos_top     => $_->pos_top,
        } } $chart->sections ],
    };

}

sub create_chart {
    my $self = shift;
    my ( $chart_data ) = @_;
    my $chart = $self->schema->resultset('Chart')->create({
        name => $chart_data->{name},
    });
    return { id => $chart->id };
}

sub get_section_by_id {
    my $self = shift;
    my ( $id ) = @_;
    my $section_rs = $self->schema->resultset('Section');
    $section_rs->result_class('DBIx::Class::ResultClass::HashRefInflator');
    my $section = $section_rs->find( { 'me.id' => $id }, { prefetch => 'section_lines'} );
    return {
        id              => $section->{id},
        chart_id        => $section->{chart_id},
        name            => $section->{name},
        display_html    => $section->{display_html},
        section_lines   => $section->{section_lines},
    };
}

sub create_section {
    my $self = shift;
    my ( $section_data ) = @_;
    my $section = $self->schema->resultset('Section')->create({
        chart_id => $section_data->{chart_id},
    });
    return {
        id            => $section->id,
        name          => $section->name,
        pos_left      => $section->pos_left,
        pos_top       => $section->pos_top,
        onward_edges  => $section->onward_edges,
    };
}
sub update_section {
    my $self = shift;
    my ( $section_data ) = @_;

    my $section_id = delete $section_data->{id};
    my $section = $self->schema->resultset('Section')->find( $section_id );
    $section->update( $section_data );

    return { 
        id      => $section->id,
        name    => $section->name,
    };
}

sub delete_section {
    my $self = shift;
    my ( $id ) = @_;
    my $section = $self->schema->resultset('Section')->find( $id );
    $section->delete;
    return { id => $id };
}

sub get_section_line_by_id {
    my $self = shift;
    my ( $id ) = @_;
    my $section_line = $self->schema->resultset('SectionLine')->find( $id );
    return {
        id              => $section_line->id,
        section_id      => $section_line->section_id,
        edit_html       => $section_line->edit_html,
    };
}

sub create_section_line {
    my $self = shift;
    my ( $section_line_data ) = @_;
    my $section_line = $self->schema->resultset('SectionLine')->create({
        section_id  => $section_line_data->{section_id},
        tool_ref    => $section_line_data->{tool_ref},
    });
    return { id => $section_line->id };
}

sub update_section_line {
    my $self = shift;
    my ( $section_line_data ) = @_;

    my $section_line_id = delete $section_line_data->{id};
    my $section_line = $self->schema->resultset('SectionLine')->find($section_line_id);

    my $success = $section_line->edit_process( $section_line_data );

    return { 
        id          => $section_line->id,
        success     => $success,
        edit_html   => $section_line->edit_html,
    };
}
sub delete_section_line {
    my $self = shift;
    my ( $id ) = @_;
    my $section_line = $self->schema->resultset('SectionLine')->find( $id );
    $section_line->delete;
    return { id => $id };
}

sub create_onward_section {
    my $self = shift;
    my ( $onward_data ) = @_;

    my $chart_id            = delete $onward_data->{chart_id};
    my $tool_ref            = delete $onward_data->{tool_ref};
    my $outward_section_id  = delete $onward_data->{outward_section_id};

    $tool_ref = 'buttons_next'; # just so you know this only for this tool (currently!)!

    # create a new section..
    my $newsection = $self->schema->resultset('Section')->create({ chart_id => $chart_id });

    # create a new section line with the correct tool on the outward section
    my $secline_hr = $self->create_section_line(
        {
            section_id  => $outward_section_id,
            tool_ref    => $tool_ref,
        },
    );
    # update new section line to references the new section
    $self->update_section_line( 
        {
            id                      => $secline_hr->{id},
            buttons_next_section_1  => $newsection->id,
            %$onward_data, # pass on what ever got passed in.
        },
    );

    return { 
        id            => $newsection->id,
        name          => $newsection->name,
        pos_left      => $newsection->pos_left,
        pos_top       => $newsection->pos_top,
        onward_edges  => $newsection->onward_edges,
    };

}

sub get_reading_by_id {
    my $self = shift;
    my ( $id ) = @_;

    my $reader = $self->get_reader(
        reading_id  => $id,
        type        => 'data_table',
        params      => { data_table_name => 'Default Data Table' },
    );

    return {
        id              => $reader->reading->id,
        chart_id        => $reader->reading->chart_id,
        display_html    => $reader->display_html,
    };
}

sub create_reading {
    my $self = shift;
    my ( $reading_data ) = @_;

    my $reading = $self->schema->resultset('Reading')->create({
        chart_id        => $reading_data->{chart_id},
    });

    return { id => $reading->id };
}

sub update_reading {
    my $self = shift;
    my ( $reading_data ) = @_;

    my $reading_id = delete $reading_data->{id};

    my $reader = $self->get_reader(
        reading_id  => $reading_id,
        type        => 'data_table',
        params      => { data_table_name => 'Default Data Table' },
    );
    my $success = $reader->display_process( $reading_data );

    return { 
        id              => $reader->reading->id,
        success         => $success,
        display_html    => $reader->display_html,
    };

}

__PACKAGE__->meta->make_immutable;
1;
