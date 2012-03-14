use utf8;
package Flowella::Schema;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

use strict;
use warnings;

use base 'DBIx::Class::Schema';

__PACKAGE__->load_namespaces;


# Created by DBIx::Class::Schema::Loader v0.07011 @ 2011-12-23 04:47:33
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:eVp1zkdsGsrMt9UK1KYtXQ

# ABSTRACT: Flowchart creator, manager and runner.

use Moose;

# The Schema needs to know what pluggable tools and readers are in use. The
# following attributes are used to give the Schema such information.

has 'available_tool_classes'    => ( is => 'rw', isa => 'HashRef', default => sub{{}} );
has 'available_reader_classes'  => ( is => 'rw', isa => 'HashRef', default => sub{{}} );

__PACKAGE__->meta->make_immutable;
1;
