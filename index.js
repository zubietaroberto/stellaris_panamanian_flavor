// Basic Requires
var fs = require('fs');
var path = require('path');
var _ = require("lodash");
var mu = require("mu2");

// Basic constants
mu.root = __dirname + '/templates'
var items_per_line = 8;
var output_folder = path.join(__dirname, 'outputs');
var output_file = path.join(output_folder, 'Panamanian.txt');

// Filepaths
var nl_panama_city_neighborhoods = path.join(__dirname, 'namelists/panama_city_neighborhoods.txt');

// Read the File Paths
var panama_city_neighborhoods = fs
  .readFileSync(nl_panama_city_neighborhoods, {encoding:'UTF-8'});

// Parse names
var output = _(panama_city_neighborhoods.split(/\r\n|\r|\n/))

  // Remove empty
  .reject( item_name  => _.isEmpty(item_name))

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

// Output file from the template using Mustache
mu
  .compileAndRender('namelist.mustache', {ship_corvettes: output})
  .on('data', data => {
    console.log(data.toString());
  })
  ;
