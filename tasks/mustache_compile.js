const mu = require("mu2")
const Promise = require("bluebird")
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const streamToPromise = require("stream-to-promise")
const _ = require('lodash')

module.exports = function(grunt) {

    grunt.registerTask('mustache_compile', function(){

        let done = this.async()
        let mu_variables = grunt.config('mustache_compile').variables
        let dynamic_variables = grunt.config('mustache_compile').dynamic_variables
        let files = grunt.config('mustache_compile').files

        Promise
            .try(dynamic_variables)
            // Add the variables to the data
            .then( data => {
                let variables = _.merge(data, mu_variables)
                return Promise
                    .all(files)
                    // Start compiling the file
                    .map(mapping => {
                        mu.root = process.cwd()
                        mapping["renderStream"] = mu.compileAndRender(mapping.src, variables)
                        return mapping
                    })
            })
            .map(mapping => {
                // Normalize destinations: must always be an array of strings
                let rel_destination_array = (_.isString(mapping.dest)) ?
                    [mapping.dest] : mapping.dest

                return Promise
                    .all(rel_destination_array)
                    .map(rel_destination => {

                        // Get the Absolute Path
                        let destination =  path.join(process.cwd(), rel_destination)
                        let array = destination.split("/") 
                        let dir = array.splice(0, array.length -1).join("/")

                        // Make sure directories exist
                        return fs.ensureDirAsync(dir).then(() => (destination))
                    })
                    // Create files
                    .map(destination => {
                        let render_stream = mapping.renderStream
                        let outputStream = fs.createWriteStream(destination, {encoding:'UTF-8'})
                        return streamToPromise(render_stream.pipe(outputStream))
                            .then(() => grunt.log.ok(destination))
                    })
            })
            // finalize
            .finally(done)
    })

}