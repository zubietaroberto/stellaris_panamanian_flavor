// Basic Requires
var fs = require('fs-extra');
var path = require('path');
const mu = require("mu2");
var _ = require("lodash");
var Promise = require('bluebird');

// Basic constants
var items_per_line = 8;

// Defines the mapping between namelists and name categories
var filenames = require('./mapping')

// Retrieves names from a namefile
const name_feeder = function(query){
  var filepath = path.join(process.cwd(), `namelists/${query.path}`);
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
        // Add prefix, if it exists
        .map( item_name       => (!_.isEmpty(query.prefix) ?
          `${query.prefix} ${item_name}` : item_name
        ))
        // Return result
        .then(  parsed_items  => ({list: parsed_items, name:query.name }) )
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
const file_generator = function(input_file, output_folder, output_file){
  return function(struct){
    return new Promise((resolve, reject) => {
      fs.ensureDir(output_folder, (err, result) => {
        var fileSystemStream = fs.createWriteStream(output_file, {encoding:'UTF-8'});
        mu
          .compileAndRender(input_file, struct)
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
module.exports = function(input_file, folder, filename){
  var input_file = path.join(process.cwd(), input_file)
  var output_folder = path.join(process.cwd(), folder);
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
    .then(file_generator(input_file, output_folder, output_file))
    ;
}
