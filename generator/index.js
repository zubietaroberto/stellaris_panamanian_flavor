// Basic Requires
const fs = require('fs/promises')
const path = require('path')
const _ = require('lodash')
const yaml = require('yaml')

// Basic constants
const items_per_line = 8

// Coroutine that feeds names from a namefile
async function name_feeder_coroutine(query) {
  let result_dictionary = {}
  for (prop in query) {
    // Iterate through the dictionary
    let property = query[prop]
    let parsed_items = []
    for (rel_path of property.namelists) {
      //Read the file
      let filepath = path.join(process.cwd(), `namelists/${rel_path}`)
      let raw_file = await fs.readFile(filepath, { encoding: 'UTF-8' })

      // Parse the names
      let names = raw_file
        .split(/\r\n|\r|\n/)
        // Remove Empty
        .filter(item_name => !_.isEmpty(item_name))
        // Remove Commented
        .filter(item_name => !_.startsWith(item_name, '#'))
        // Remove Spaces at Beginning and End
        .map(_.trim)
        // Add prefix, if it exists
        .map(
          item_name =>
            !_.isEmpty(property.prefix)
              ? `${property.prefix} ${item_name}`
              : item_name
        )

      // Add the names to the accumulator
      parsed_items.push(...names)
    }

    // Return the mapping
    result_dictionary[prop] = parsed_items

    console.log(`Count: ${prop} => ${parsed_items.length} `)
  }

  return result_dictionary
}

// Merges names into rows
function row_accumulator(struct) {
  let result_dictionary = {}
  for (var prop in struct) {
    // Parse names
    let output = struct[prop]
      //Join into lines
      .reduce((out_array, item_name, counter) => {
        if (counter % items_per_line == 0) {
          // Add a new line
          out_array.push('')
        }
        out_array[Math.floor(counter / items_per_line)] += `"${item_name}" `
        return out_array
      }, [])
      // Add Line Breaks
      .join('\n\t\t\t')
    result_dictionary[prop] = output
  }
  return result_dictionary
}

// Coroutine that loads the YAML Mapping
async function load_mapping_coroutine() {
  let filepath = path.join(process.cwd(), 'generator/mapping.yml')
  let output = await fs.readFile(filepath, 'utf-8')
  let mapping = yaml.parse(output)
  return mapping.mappings
}

/*
* ENTRY POINT. Returns a Promise that returns the mapping for the template,
* ready for compilation into any templating engine.
*/
module.exports = async function() {
  const mapping = await load_mapping_coroutine();
  const names = await name_feeder_coroutine(mapping);
  const rows = row_accumulator(names);
  return rows;
}
