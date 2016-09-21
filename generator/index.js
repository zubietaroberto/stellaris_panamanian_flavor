// Basic Requires
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const _ = require("lodash")
const yaml = Promise.promisifyAll(require('js-yaml'))

// Basic constants
var items_per_line = 8;

// Coroutine that feeds names from a namefile
const name_feeder_coroutine = Promise.coroutine(function*(query){

  // Result
  let parsed_items = []
  for(rel_path of query.namelists){

    //Read the file
    let filepath = path.join(process.cwd(), `namelists/${rel_path}`) 
    let raw_file = yield fs.readFileAsync(filepath, {encoding:'UTF-8'})

    // Parse the names
    let names = raw_file.split(/\r\n|\r|\n/)
        // Remove Empty
        .filter( item_name    => !_.isEmpty(item_name))
        // Remove Commented
        .filter( item_name    => !_.startsWith(item_name, "#"))
        // Add prefix, if it exists
        .map( item_name       => (!_.isEmpty(query.prefix) ?
          `${query.prefix} ${item_name}` : item_name
        ))

    // Add the names to the accumulator
    _.merge(parsed_items, names)
  }

  // Return the mappping
  return {list: parsed_items, name:query.name }
})

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

// Coroutine that loads the YAML Mapping
const load_mapping_coroutine = Promise.coroutine(function*(){
    let filepath  = path.join(process.cwd(), 'generator/mapping.yml')
    let output    = yield fs.readFileAsync(filepath, 'utf-8')
    let mapping   = yaml.safeLoad(output)
    return mapping.mappings
})

/*
* ENTRY POINT. Returns a Promise that returns the mapping for the template,
* ready for compilation into any templating engine.
*/
module.exports = function(){
  return Promise
    //Load the Mapping
    .try(load_mapping_coroutine)

    // Transform each filename into a namelist
    .map(name_feeder_coroutine)

    // Merge filelists into a single dictionary
    .reduce(name_accumulator, {})

    // Organize elements in rows
    .then(row_accumulator)
}
