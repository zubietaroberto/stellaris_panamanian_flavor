
// Basic Requires
var fs = require('fs');
var path = require('path');

// Filepaths
var nl_panama_city_neighborhoods = path.join(__dirname, 'namelists/panama_city_neighborhoods.txt');

// Read the File Paths
fs.readFile(nl_panama_city_neighborhoods, {encoding:'UTF-8'}, (err, data) => {

  if(err) console.log(err);
  else{
    var lines = data.split(/\r\n|\r|\n/);
    console.log(lines.length);
  }

});
