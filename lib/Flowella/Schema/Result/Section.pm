use utf8;
package Flowella::Schema::Result::Section;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Flowella::Schema::Result::Section

=cut

use strict;
use warnings;

use base 'DBIx::Class::Core';

=head1 COMPONENTS LOADED

=over 4

=item * L<DBIx::Class::InflateColumn::DateTime>

=back

=cut

__PACKAGE__->load_components("InflateColumn::DateTime");

=head1 TABLE: C<sections>

=cut

__PACKAGE__->table("sections");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 chart_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 name

  data_type: 'varchar'
  is_nullable: 0
  size: 25

=head2 weight

  data_type: 'integer'
  default_value: 0
  is_nullable: 0

=head2 added

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=head2 updated

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=head2 pos_left

  data_type: 'integer'
  default_value: 0
  is_nullable: 0

=head2 pos_top

  data_type: 'integer'
  default_value: 0
  is_nullable: 0

=cut

__PACKAGE__->add_columns(
  "id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "chart_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "name",
  { data_type => "varchar", is_nullable => 0, size => 25 },
  "weight",
  { data_type => "integer", default_value => 0, is_nullable => 0 },
  "added",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
  },
  "updated",
  {
    data_type     => "timestamp",
    default_value => \"current_timestamp",
    is_nullable   => 0,
  },
  "pos_left",
  { data_type => "integer", default_value => 0, is_nullable => 0 },
  "pos_top",
  { data_type => "integer", default_value => 0, is_nullable => 0 },
);

=head1 PRIMARY KEY

=over 4

=item * L</id>

=back

=cut

__PACKAGE__->set_primary_key("id");

=head1 UNIQUE CONSTRAINTS

=head2 C<chart_id_name_unique>

=over 4

=item * L</chart_id>

=item * L</name>

=back

=cut

__PACKAGE__->add_unique_constraint("chart_id_name_unique", ["chart_id", "name"]);

=head1 RELATIONS

=head2 chart

Type: belongs_to

Related object: L<Flowella::Schema::Result::Chart>

=cut

__PACKAGE__->belongs_to(
  "chart",
  "Flowella::Schema::Result::Chart",
  { id => "chart_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);

=head2 read_sections

Type: has_many

Related object: L<Flowella::Schema::Result::ReadSection>

=cut

__PACKAGE__->has_many(
  "read_sections",
  "Flowella::Schema::Result::ReadSection",
  { "foreign.section_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 section_lines

Type: has_many

Related object: L<Flowella::Schema::Result::SectionLine>

=cut

__PACKAGE__->has_many(
  "section_lines",
  "Flowella::Schema::Result::SectionLine",
  { "foreign.section_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07011 @ 2011-12-23 04:47:33
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:IRBrba7/4B26telSQCHTnQ

# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
with 'Flowella::Schema::Roles::Result::Section';
__PACKAGE__->meta->make_immutable(inline_constructor => 0);
1;
