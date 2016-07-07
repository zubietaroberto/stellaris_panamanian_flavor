var Promise = require('bluebird');
var namelist_generator = require('./namelist_generator');

var target_dir = 'output/panamanian_flavor/common/name_lists';
var target_file = 'Panamanian.txt'

Promise
  .resolve(namelist_generator(target_dir, target_file))
  ;
