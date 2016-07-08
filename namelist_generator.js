// Basic Requires
var fs = require('fs-extra');
var path = require('path');
var _ = require("lodash");
var mu = require("mu2");
var Promise = require('bluebird');

// Basic constants
mu.root = __dirname + '/templates'
var items_per_line = 8;

// Filepaths
var filenames = [
  {
    path:'neighborhoods.txt',
    name:'ship_corvettes'
  },
  {
    path:'streets.txt',
    name:'ship_destroyers'
  },
  {
    path:'rivers.txt',
    name:'ship_cruiser',
  },
  {
    path:'mountains.txt',
    name:'ship_cruiser',
  },
  {
    path:'artists.txt',
    name:'ship_science',
  },
  {
    path:'sports.txt',
    name:'ship_constructors',
  },
  {
    path:'colonial.txt',
    name:'ship_generic',
  },
  {
    path:'music.txt',
    name:'ship_colony',
  },
  {
    path:'vip_historical.txt',
    name:'ship_battleship',
  },
  {
    path:'herrera.txt',
    name:'planet_desert',
  },
  {
    path:'los_santos.txt',
    name:'planet_arid',
  },
  {
    path:'chiriqui.txt',
    name:'planet_tundra',
  },
  {
    path:'fauna.txt',
    name:'fort',
  },
  {
    path:'martyrs_january_9.txt',
    name:'outpost',
  },
  {
    path:'mountain_towns.txt',
    name:'planet_arctic',
  },
  {
    path:'islands.txt',
    name:'planet_ocean',
  },
  {
    path:'beaches.txt',
    name:'planet_tropical',
  },
  {
    path:'towns_other.txt',
    name:'planet_continental',
  },
  {
    path:'panama_canal.txt',
    name:'planet_gaia',
  },

  {
    path:'archeology.txt',
    name:'planet_tomb',
  },
  {
    path:'filler_planets.txt',
    name:'planet_generic',
  },
  {
    path:'province_capitals.txt',
    name:'planet_generic',
  },
  {
    path:'panama_canal_zone.txt',
    name:'transport',
  },

  {
    path:'names_male.txt',
    name:'names_male',
  },
  {
    path:'names_female.txt',
    name:'names_female',
  },
  {
    path:'surnames.txt',
    name:'surnames',
  },
  {
    path:'regnal_male.txt',
    name:'regnal_male',
  },
  {
    path:'regnal_female.txt',
    name:'regnal_female',
  },
  {
    path:'regnal_surnames.txt',
    name:'regnal_surnames',
  },
]

// Retrieves names from a namefile
const name_feeder = function(filename){
  var filepath = path.join(__dirname, `namelists/${filename.path}`);
  return Promise
    .fromCallback(  cb => fs.readFile(filepath, {encoding:'UTF-8'}, cb))

    // Parse files into a list of names
    .then(    raw_file => {
      return Promise
        .all(raw_file.split(/\r\n|\r|\n/))
        // Remove Empty
        .filter( item_name    => !_.isEmpty(item_name))
        // Remove Commented
        .filter( item_name    => !_.startsWith(item_name, "#"))
        // Return result
        .then(  parsed_items  => ({list: parsed_items, name:filename.name }) )
        ;
    })
    ;
};

// Merges all filenames into a single dictionary
const name_accumulator = function(accumulator, parsed_file){
  if (!_(accumulator).has(parsed_file.name)){
    accumulator[parsed_file.name] = parsed_file.list;
  } else {
    var new_array = _.concat(accumulator[parsed_file.name], parsed_file.list);
    accumulator[parsed_file.name] = new_array;
  }
  return accumulator;
};

// Merges names into rows
const row_accumulator = function(struct){
  for(var prop in struct){

    // Parse names
    var output = _(struct[prop])

      //Join into lines
      .reduce( (out_array, item_name, counter) => {
        if (counter%items_per_line == 0){
          // Add a new line
          out_array.push("\t\t\t");
        }
        out_array[Math.floor(counter/items_per_line)] += `"${item_name}" `;
        return out_array;
      }, [])

      // Add Line Breaks
      .join("\n")
      ;
    struct[prop] = output;
  }
  return struct;

};

// Creates the file
const file_generator = function(output_folder, output_file){
  return function(struct){
    return new Promise((resolve, reject) => {
      fs.ensureDir(output_folder, (err, result) => {
        var fileSystemStream = fs.createWriteStream(output_file, {encoding:'UTF-8'});
        mu
          .compileAndRender('namelist.txt.mustache', struct)
          .pipe(fileSystemStream)
          .on('finish', resolve)
          ;
      });
    });
  };
};

/*
* ENTRY POINT. Returns a Promise that resolves when the file is complete.
*/
module.exports = function(folder, filename){

  var output_folder = path.join(__dirname, folder);
  var output_file = path.join(output_folder, filename);

  return Promise
    .all(filenames)

    // Transform each filename into a namelist
    .map(name_feeder)

    // Merge filelists into a single dictionary
    .reduce(name_accumulator, {})

    // Organize elements in rows
    .then(row_accumulator)

    // Output file from the template using Mustache
    .then(file_generator(output_folder, output_file))
    ;
}
