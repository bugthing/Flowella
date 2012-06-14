Flowella - Process Engine
=========================

Development Notes:
------------------
 
Project was started like this:
  wget http://gist.github.com/raw/2127281/boil.sh
  chmod u+x ./boil.sh
  ./boil.sh Flowella
  cd Flowella

Start the App:
------------------

* plackup --port 9090 bin/app.psgi

Database Stuff:
------------------

  # Flowella::Schema 

  # demo database.
  sqlite3 ./etc/db/flowella.db < ./etc/db/schema.sql

  # test database.
  sqlite3 ./t/etc/db/flowella.db < ./etc/db/schema.sql
  sqlite3 ./t/etc/db/flowella.db < ./t/etc/db/test_data.sql

  # build DBIx::Class:

  dbicdump -o dump_directory=./lib \
      -o components='["InflateColumn::DateTime"]' \
      -o debug=1 \
      Flowella::Schema \
      'dbi:SQLite:dbname=./etc/db/flowella.db' 

  # Flowella::Reader::DataTable::Schema

  sqlite3 ./etc/db/datatable.db < ./etc/db/datatable_schema.sql

  dbicdump -o dump_directory=./lib \
      -o components='["InflateColumn::DateTime"]' \
      -o debug=1 \
      Flowella::Reader::DataTable::Schema \
      'dbi:SQLite:dbname=./etc/db/datatable.db' 

Use Interface:
-----------------------
   
  CSS - Layout: 
      http://twitter.github.com/bootstrap/

  JS MVC Framwork
      http://docs.emberjs.com

  JS Framework:
      http://jquery.com/

  JS UI Parts (drap'n'drop etc.):
      http://jqueryui.com/

  Flow chart visualisation:
      http://jsplumb.org/
      http://jsplumb.googlecode.com/files/jquery.jsPlumb-1.3.7-all.js

Build and Deploy - 
-----------------------

  Using: DotCloud (http://docs.dotcloud.com/)
      sudo aptitude install python-setuptools
      sudo easy_install dotcloud
      dotcloud create flowella

  Build:
      dzil build

  Deploy:
      dotcloud push flowella
      (you may need to update dotcloud.yml to point the build dir)

Useful Commands
---------------

* Mass search and replace
  find . -name "*.*" -print -type f | xargs sed -i 's/foo/bar/g'

* Install (via cpanm) perl modules
  for cp in `dzil listdeps`; do cpanm $cp; done

Get EmberJS, Complile and integrate EmberJS
--------------------------------------------

git submodule add git://github.com/emberjs/ember.js.git ./submodules/ember.js
cd ./submodules/ember.js/
bundle install
rake
cd ../../
mkdir public/css/bootstrap
mkdir public/js/bootstrap
mkdir public/js/emberjs
cp submodules/bootstrap/docs/assets/css/bootstrap.css ./public/css/bootstrap/bootstrap.css
cp submodules/bootstrap/docs/assets/css/bootstrap-responsive.css ./public/css/bootstrap/bootstrap-responsive.css
cp submodules/ember.js/dist/ember.js ./public/js/emberjs/ember.js
for FILE in \
    bootstrap-transition.js   \
    bootstrap-alert.js        \
    bootstrap-modal.js        \
    bootstrap-dropdown.js     \
    bootstrap-scrollspy.js    \
    bootstrap-tab.js          \
    bootstrap-tooltip.js      \
    bootstrap-popover.js      \
    bootstrap-button.js       \
    bootstrap-collapse.js     \
    bootstrap-carousel.js     \
    bootstrap-typeahead.js    
do
    cp submodules/bootstrap/js/$FILE ./public/js/bootstrap/$FILE
done
