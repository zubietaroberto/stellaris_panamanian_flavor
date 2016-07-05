// Basic Requires
var fs = require('fs');
var path = require('path');
var _ = require("lodash");
var mu = require("mu2");
var Promise = require('bluebird');

// Basic constants
mu.root = __dirname + '/templates'
var items_per_line = 8;
var output_folder = path.join(__dirname, 'outputs');
var output_file = path.join(output_folder, 'Panamanian.txt');

// Filepaths
var filenames = [
  {
    path:'panama_city_neighborhoods.txt',
    name:'ship_corvettes'
  },
  {
    path:'panama_city_streets.txt',
    name:'ship_destroyers'
  },
  {
    path:'panama_rivers.txt',
    name:'ship_constructors',
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
]

Promise
  .all(filenames)

  // Transform each filename into a namelist
  .map( filename => {
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
  })

  //Accumulate namelists
  .reduce( (accumulator, parsed_file) => {
    if (!_(accumulator).has(parsed_file.name)){
      accumulator[parsed_file.name] = parsed_file.list;
    } else {
      var new_array = _.concat(accumulator[parsed_file.name], parsed_file.list);
      accumulator[parsed_file.name] = new_array;
    }
    return accumulator;
  }, {})

  .then(struct => {
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

  })

  // Output file from the template using Mustache
  .then(struct => {
    mu
      .compileAndRender('namelist.mustache', struct)
      .on('data', data => {
        console.log(data.toString());
      })
      ;

  })
  ;
