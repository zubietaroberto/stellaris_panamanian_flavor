const mu = require("mu2")
const Promise = require("bluebird")
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const streamToPromise = require("stream-to-promise")

module.exports = function(grunt) {

    grunt.registerTask('mustache_compile', function(){
        var done = this.async()
        let mu_variables = grunt.config('mustache_compile').variables
        for(mapping of grunt.config('mustache_compile').files){

            mu.root = process.cwd()
            let render_stream = mu.compileAndRender(mapping.src, mu_variables)
            
            // Main Chain
            Promise
                .all(mapping.dest)
                // Get the Absolute Path
                .map(relative_destination => {
                    return path.join(process.cwd(), relative_destination)
                })
                // Make sure directories exist
                .map(destination => {
                    let array = destination.split("/") 
                    let dir = array.splice(0, array.length -1).join("/")
                    return fs
                        .ensureDirAsync(dir)
                        .then(() => destination)
                })
                // Create files
                .map(output => {
                    grunt.log.verbose.ok(output)
                    outputStream = fs.createWriteStream(output, {encoding:'UTF-8'})
                    return streamToPromise(render_stream.pipe(outputStream))
                })
                // Feedback
                .then( dest => 
                    grunt.log.ok(`Processed ${dest.length} files`)
                )
                // finalize
                .finally(done)
        }
    })

}