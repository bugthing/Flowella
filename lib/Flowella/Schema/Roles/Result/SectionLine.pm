package Flowella::Schema::Roles::Result::SectionLine;
# ABSTRACT: Flowchart creator, manager and runner.

use Moose::Role;
use DBIx::Class::InflateColumn::Serializer;
use Carp;

=head1 NAME

Flowella::Schema::Roles::Result::SectionLine - Role for corresponding class.

=head1 CLASS ALTERATIONS

SchemaLoader handles building the skelatal structure of the ResultSet for now,
any changes to the column definitions can be calling the setup/configuration 
methods again.

=cut

Flowella::Schema::Result::SectionLine->load_components(
    'InflateColumn::Serializer',
    'DynamicDefault',
    'TimeStamp',
);
Flowella::Schema::Result::SectionLine->add_columns(
    'params' => {
        'data_type'         => 'blob',
        'serializer_class'  => 'JSON',
    },
    "weight",
    {  
        data_type                   => "integer",
        default_value               => 0,
        is_nullable                 => 0,
        dynamic_default_on_create   => \&weight_dynamic_default_on_create
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

=head1 METHODS

=over

=item weight_dynamic_default_on_create

Returns the default for the weight. Applied via the componant DynamicDefault.

=cut

sub weight_dynamic_default_on_create
{
    my $self = shift;
    my $section = $self->section;
    my $max_weight = $section->section_lines->get_column('weight')->max();
    $max_weight ||= 0;
    return ( $max_weight + 1 );
}

=item tool 

Method to dynamically find and load the tool linked to this SectionLine.
Finds the tool by matching the 'tool_ref' against this found by Flowella. 

SectionLines are linked to tool classes, this instanciatd the tool class 
passing in the sectionline result object.

B<Returns>

ObjectRef   - Instanciated tool object.

=cut

sub tool {
    my $self = shift;

    my @args = ();
    @args = @_ if @_;

    my $class = $self->result_source->schema->available_tool_classes->{ 
        $self->tool_ref
    };

    carp("Could not find class for tool referenced via:" . $self->tool_ref ) 
        unless $class;

    # build new object of the tool class (passing in the schema)
    Class::MOP::load_class($class);
    my $obj = $class->new( 
        section_line => $self,
        @args, 
    );

    return $obj;
}

=item edit_html

Check the object this SectionLine is linked to and returns it edit_html

=cut

sub edit_html {
    my $self = shift;
    return $self->tool->edit_html;
}

=item edit_process( $form_data )

Method called when processing an edit of a SectionLine

The passed in $form_data may have a 'weight' key, which is pulled out and applied 
to the corrosponding field before $form_data is saved in the 'params' field.

Args: hashref - Form Data 
Returns: boolean (success or failed)

=cut

sub edit_process {
    my $self = shift;

    my ( $form_data ) = @_;

    # pull out and apply weight if we have been passed it.
    my $weight = delete $form_data->{weight};
    $self->update( { 'weight' => $weight } ) if defined $weight;

    # save the passed in form data in the 'params' field.
    $self->params( $form_data );
    $self->update();

    return $self->tool->is_edit_ok;
}

=item onward_edges

Runs through each tool and builds an array of all edges.
An edge is 3 element arrayref of FROM and TO section IDs with an optional 
hashref of edge data.

B<Returns>

ArrayRef    - ArrayRef of ArrayRefs (aka. edges)

=cut

sub onward_edges {
    my $self = shift;
    my @edges;
    foreach my $edge ( @{ $self->tool->onward_edges } ) {
        push ( 
            @edges, 
            [ $self->section->id, ( delete $edge->{section_id} ), $edge ]
        );
    }
    return \@edges;
}

=back

=cut

1;
