package Flowella::Schema::Roles::Result::Section;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;

=head1 NAME

Flowella::Schema::Roles::Result::Section - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::Section->load_components(
    'DynamicDefault',
    'TimeStamp',
);
Flowella::Schema::Result::Section->add_columns(
    "name",
    { 
        data_type                   => "varchar", 
        is_nullable                 => 0, 
        size                        => 25,
        dynamic_default_on_create   => \&name_dynamic_default_on_create,
    },
    "weight",
    { 
        data_type                   => "integer", 
        default_value               => 0, 
        is_nullable                 => 0,
        dynamic_default_on_create   => \&weight_dynamic_default_on_create,
    },
    "pos_left",
    { 
        data_type => "integer", default_value => 0, is_nullable => 0,
        dynamic_default_on_create   => \&pos_left_dynamic_default_on_create,
    },
    "pos_top",
    { 
        data_type => "integer", default_value => 0, is_nullable => 0,
        dynamic_default_on_create   => \&pos_top_dynamic_default_on_create,
    },
    "added",
    {
      data_type     => "timestamp", default_value => \"current_timestamp",
      is_nullable   => 0, set_on_create => 1, set_on_update => 0 
    },
    "updated",
    {
      data_type     => "timestamp", default_value => \"current_timestamp",
      is_nullable   => 0, set_on_create => 1, set_on_update => 1 
    },
);

# turn cascade deleting on.
# ensure the order of the section_lines returned.
Flowella::Schema::Result::Section->has_many(
  "section_lines",
  "Flowella::Schema::Result::SectionLine",
  { "foreign.section_id" => "self.id" },
  { 
      cascade_copy      => 0, 
      cascade_delete    => 1,
      order_by          => { -asc => 'weight'},
  },
);




=head1 METHODS

=over

=item name_dynamic_default_on_create

Returns the default for the name. Applied via the componant DynamicDefault.

=cut

sub name_dynamic_default_on_create
{
    my $self = shift;
    my $chart = $self->chart;

    # here i ensure the name is unique..
    my $section_name = '';
    my $number_of_sections = $chart->sections->count;
    my $count = 0;
    my $loops = 0;
    do {
        $loops++;
        $section_name  = 'Section ' . ($number_of_sections + $loops);
        $count = $chart->search_related( 'sections', { name => $section_name } )->count;
    } until ( $count == 0 );

    return $section_name;
}

=item weight_dynamic_default_on_create

Returns the default for the weight. Applied via the componant DynamicDefault.

=cut

sub weight_dynamic_default_on_create
{
    my $self = shift;
    my $chart = $self->chart;
    my $max_weight = $chart->sections->get_column('weight')->max();
    $max_weight ||= 0;
    return ( $max_weight + 1 );
}

=item pos_left_dynamic_default_on_create

Returns the default for the pos_left. Applied via the componant DynamicDefault.

=cut

sub pos_left_dynamic_default_on_create
{
    my $self = shift;
    my $chart = $self->chart;
    my $last_pos_left = $chart->search_related('sections', {}, { order_by => { -desc => 'updated' } } )->get_column('pos_left')->first();
    $last_pos_left ||= 0;
    return ( $last_pos_left + 50 );
}

=item pos_top_dynamic_default_on_create

Returns the default for the pos_top. Applied via the componant DynamicDefault.

=cut

sub pos_top_dynamic_default_on_create
{
    my $self = shift;
    my $chart = $self->chart;
    my $last_pos_top = $chart->search_related('sections', {}, { order_by => { -desc => 'updated' } } )->get_column('pos_top')->first();
    $last_pos_top ||= 0;
    return ( $last_pos_top + 50 );
}


=item onward_edges

Runs through each section line and collects all the onward edges

B<Returns>

ArrayRef    - ArrayRef of ArrayRefs aka Edges

=cut

sub onward_edges {
    my $self = shift;
    my @edges;
    my $section_lines_rs = $self->section_lines;
    while ( my $section_line = $section_lines_rs->next ) {
        my $sl_edges = $section_line->onward_edges;
        next unless $sl_edges;
        push ( @edges, @{ $sl_edges } );
    }
    return \@edges;
}

=item onward_sections

Run through all the onward edges and build a resultset of onward sections.

=cut

sub onward_sections {
    my $self = shift;

    my @all_outgoing_sections;
    foreach ( @{ $self->onward_edges } ) {
        my $onward_section =  $self->chart->sections->find( $_->[1] );
        push ( @all_outgoing_sections, $onward_section ) if $onward_section;
    }

    # make a resultset out of the list of sections..
    my $new_rs = $self->result_source->resultset;
    $new_rs->set_cache( \@all_outgoing_sections );
    return $new_rs;
}

=back

=cut

1;
