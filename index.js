var Promise = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var mu = require("mu2");

var namelist_generator = require('./namelist_generator');

mu.root = __dirname + '/templates';

const mod_name = "panamanian_flavor";

const build_descriptor = function(){

  var target_dir = `output/${mod_name}`;
  fs.ensureDir(target_dir, (err, result) => {

    // Same file, copy 1
    var output_file1 = path.join(__dirname, `output/${mod_name}.mod`)
    var outputStream1 = fs.createWriteStream(output_file1, {encoding:'UTF-8'});

    // Same file, copy 2
    var output_file2 = path.join(__dirname, `output/${mod_name}/descriptor.mod`);
    var outputStream2 = fs.createWriteStream(output_file2, {encoding:'UTF-8'});

    // Render the descriptor into both files
    var render_stream = mu.compileAndRender('descriptor.mod.mustache', {
      mod_name: mod_name
    });

    render_stream.pipe(outputStream1);
    render_stream.pipe(outputStream2);
  });
}

const build_namelist = function(){

  var target_dir = `output/${mod_name}/common/name_lists`;
  var target_file = 'Panamanian.txt'

  return namelist_generator(target_dir, target_file)
};

Promise
  .resolve(build_namelist)
  .then(build_descriptor)
  ;
