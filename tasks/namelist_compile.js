const Promise = require("bluebird")
const generator = require('../generator')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const mu = require("mu2")
const streamToPromise = require("stream-to-promise")

module.exports = function(grunt){

    grunt.registerTask('namelist_compile', function(){

        let async = this.async()

        let input_file      = grunt.config('namelist_compile').src
        let target_dir      = grunt.config('namelist_compile').target_dir
        let target_filename = grunt.config('namelist_compile').target_filename

        let output_folder       = path.join(process.cwd(), target_dir)
        let output_filepath     = path.join(output_folder, target_filename)
        let template_filepath   = path.join(process.cwd(), input_file)

        fs
            // Make output directory. Using bluebird.PromisifyAll virtual method
            .ensureDirAsync(output_folder)
            // Read Namefiles and organize them in lines
            .then( generator )
            // Output file from the template using Mustache and 
            // the compiled namefiles
            .then( compiled_namefiles => {
                let renderStream = mu.compileAndRender(
                        template_filepath, compiled_namefiles
                    )
                let fileSystemStream = fs.createWriteStream(
                        output_filepath, {encoding:'UTF-8'}
                    )
                return streamToPromise(renderStream.pipe(fileSystemStream))
            })
            // Feedback
            .then(() => grunt.log.ok(`Processed 1 file`))
            // End
            .finally(async)
    })
}