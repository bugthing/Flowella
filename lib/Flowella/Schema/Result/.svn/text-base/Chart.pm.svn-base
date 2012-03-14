use utf8;
package Flowella::Schema::Result::Chart;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Flowella::Schema::Result::Chart

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

=head1 TABLE: C<charts>

=cut

__PACKAGE__->table("charts");

=head1 ACCESSORS

=head2 id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0

=head2 name

  data_type: 'varchar'
  is_nullable: 0
  size: 25

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
  "name",
  { data_type => "varchar", is_nullable => 0, size => 25 },
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

=head1 UNIQUE CONSTRAINTS

=head2 C<name_unique>

=over 4

=item * L</name>

=back

=cut

__PACKAGE__->add_unique_constraint("name_unique", ["name"]);

=head1 RELATIONS

=head2 readings

Type: has_many

Related object: L<Flowella::Schema::Result::Reading>

=cut

__PACKAGE__->has_many(
  "readings",
  "Flowella::Schema::Result::Reading",
  { "foreign.chart_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);

=head2 sections

Type: has_many

Related object: L<Flowella::Schema::Result::Section>

=cut

__PACKAGE__->has_many(
  "sections",
  "Flowella::Schema::Result::Section",
  { "foreign.chart_id" => "self.id" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07011 @ 2011-12-23 04:47:33
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:xEffFMGqYPP4DVuZnI1QZQ

# ABSTRACT: Flowchart creator, manager and runner.

use Moose;
with 'Flowella::Schema::Roles::Result::Chart';
__PACKAGE__->meta->make_immutable(inline_constructor => 0);
1;
