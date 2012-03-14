use utf8;
package Flowella::Schema::Result::SectionLine;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Flowella::Schema::Result::SectionLine

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

=head1 TABLE: C<section_lines>

=cut

__PACKAGE__->table("section_lines");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 section_id

  data_type: 'integer'
  is_foreign_key: 1
  is_nullable: 0

=head2 tool_ref

  data_type: 'varchar'
  is_nullable: 0
  size: 25

=head2 weight

  data_type: 'integer'
  default_value: 0
  is_nullable: 0

=head2 params

  data_type: 'blob'
  is_nullable: 1

=head2 added

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=head2 updated

  data_type: 'timestamp'
  default_value: current_timestamp
  is_nullable: 0

=cut

__PACKAGE__->add_columns(
  "id",
  { data_type => "integer", is_auto_increment => 1, is_nullable => 0 },
  "section_id",
  { data_type => "integer", is_foreign_key => 1, is_nullable => 0 },
  "tool_ref",
  { data_type => "varchar", is_nullable => 0, size => 25 },
  "weight",
  { data_type => "integer", default_value => 0, is_nullable => 0 },
  "params",
  { data_type => "blob", is_nullable => 1 },
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
);

=head1 PRIMARY KEY

=over 4

=item * L</id>

=back

=cut

__PACKAGE__->set_primary_key("id");

=head1 RELATIONS

=head2 section

Type: belongs_to

Related object: L<Flowella::Schema::Result::Section>

=cut

__PACKAGE__->belongs_to(
  "section",
  "Flowella::Schema::Result::Section",
  { id => "section_id" },
  { is_deferrable => 1, on_delete => "CASCADE", on_update => "CASCADE" },
);


# Created by DBIx::Class::Schema::Loader v0.07011 @ 2011-12-23 04:47:33
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:Ae3qoBhDfO7jiEF4iVh75Q

# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
with 'Flowella::Schema::Roles::Result::SectionLine';
__PACKAGE__->meta->make_immutable(inline_constructor => 0);
1;
