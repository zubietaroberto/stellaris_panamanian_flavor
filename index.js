var Promise = require('bluebird');
var fs = require('fs-extra');
var path = require('path');
var mu = require("mu2");
var streamToPromise = require("stream-to-promise");

var namelist_generator = require('./namelist_generator');

mu.root = __dirname + '/templates';

const mod_name = "panamanian_flavor";

// Build the mod descriptor file
const build_descriptor = function(){

  var target_dir = `output/${mod_name}`;

  return Promise
    .fromCallback( cb => fs.ensureDir(target_dir, cb))
    .then( data => {

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

      // Execute both operations
      return Promise.all([
        streamToPromise(render_stream.pipe(outputStream1)),
        streamToPromise(render_stream.pipe(outputStream2))
      ])
  });
}

// Build the Prescripted empire
const build_prescripted_empire = function(){
  var target_dir = `output/${mod_name}/prescripted_countries`;
  return Promise
    .fromCallback( cb => fs.ensureDir(target_dir, cb))
    .then( data => {

      var output_file = path.join(__dirname, `${target_dir}/prescripted_countries.txt`);
      var outputStream = fs.createWriteStream(output_file, {encoding:'UTF-8'});

      var render_stream = mu.compileAndRender('species.txt.mustache', {
        mod_name: mod_name
      });

      return streamToPromise(render_stream.pipe(outputStream));
  });
}

// Copy the translation strings
const copy_translations = function(){
  var target_dir = `output/${mod_name}/localisation`

  return Promise
    .fromCallback( cb => fs.ensureDir(target_dir, cb))
    .then( data => {
      var output_file1 = path.join(__dirname, `${target_dir}/pty_l_english.yml`);
      var input_file1 = path.join(__dirname, 'templates/l_english.yml');
      let readStream1 = fs.createReadStream(input_file1)
      let outputStream1 = readStream1.pipe(fs.createWriteStream(output_file1))

      var output_file2 = path.join(__dirname, `${target_dir}/pty_l_spanish.yml`);
      var input_file2 = path.join(__dirname, 'templates/l_spanish.yml');
      let readStream2 = fs.createReadStream(input_file2)
      let outputStream2 = readStream2.pipe(fs.createWriteStream(output_file2))

      return Promise.all([
        streamToPromise(outputStream1),
        streamToPromise(outputStream2)
      ])
  })
}

// Build the Namelist
const build_namelist = function(){

  var target_dir = `output/${mod_name}/common/name_lists`;
  var target_file = 'panamanian.txt'

  return namelist_generator(target_dir, target_file)
};

//Copy the thumbnail image
const copy_thumbnail = function(){
  var target_dir = `output/${mod_name}`;

  return Promise
    .fromCallback( cb => fs.ensureDir(target_dir, cb))
    .then( data => {
      var output_file = path.join(__dirname, `${target_dir}/${mod_name}.jpg`);
      var input_file = path.join(__dirname, 'templates/thumbnail.jpg');
      var readStream = fs.createReadStream(input_file);
      var outputStream = readStream.pipe(fs.createWriteStream(output_file));

      return streamToPromise(outputStream);
  });
}

// Main operation chain
Promise
  .all([
    build_namelist(),
    build_descriptor(),
    build_prescripted_empire(),
    copy_thumbnail(),
    copy_translations(),
  ])
  .then( () => console.log("Output complete") )
