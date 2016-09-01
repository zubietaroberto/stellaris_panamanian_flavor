const Promise = require("bluebird")
const generator = require('../generator')

module.exports = function(grunt){

    grunt.registerTask('namelist_compile', function(){

        let async = this.async()

        let input_file      = grunt.config('namelist_compile').src
        let target_dir      = grunt.config('namelist_compile').target_dir
        let target_filename = grunt.config('namelist_compile').target_filename

        Promise
            .try(() => {
                return generator(input_file, target_dir, target_filename)
            })
            .then(async)
    })
}