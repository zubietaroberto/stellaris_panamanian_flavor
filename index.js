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
    path: path.join(__dirname, 'namelists/panama_city_neighborhoods.txt'),
    name:'ship_corvettes'
  },
  {
    path: path.join(__dirname, 'namelists/panama_city_streets.txt'),
    name:'ship_destroyers'
  },
  {
    path: path.join(__dirname, 'namelists/panama_rivers.txt'),
    name:'ship_constructors',
  },
  {
    path: path.join(__dirname, 'namelists/herrera.txt'),
    name:'planet_desert',
  },

  // January 9th Martyrs. Source: http://panamapoesia.com/9enero02.php
  // January 9th Massacre: https://en.wikipedia.org/wiki/Martyrs%27_Day_(Panama)
  {
    path: path.join(__dirname, 'namelists/martyrs_january_9.txt'),
    name:'outpost',
  }
]

Promise
  .all(filenames)

  // Transform each filename into a namelist
  .map( filename => {
    return Promise
      .fromCallback(cb => fs.readFile(filename.path, {encoding:'UTF-8'}, cb))
      .then(raw_file => {
        var parsed_items = _(raw_file.split(/\r\n|\r|\n/))
          // Remove Empty
          .reject(item_name  => _.isEmpty(item_name))
        return {list: parsed_items, name:filename.name }
      })
      ;
  })

  //Accumulate namelists
  .reduce( (accumulator, parsed_file) => {
    if (!_(accumulator).has(parsed_file.name)){
      accumulator[parsed_file.name] = parsed_file.list;
    } else {
      accumulator[parsed_file.name].push(parsed_file.list);
    }
    return accumulator;
  }, {})

  .then(struct => {
    for(var prop in struct){

      // Parse names
      var output = _(struct[prop])

        //Reduce to lines of eight
        .reduce( (out_array, item_name, counter) => {

          // Every eight items, add a new line
          if (counter%items_per_line == 0){
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
