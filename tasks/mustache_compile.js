const mu = require("mu2")
const Promise = require("bluebird")
const _ = require('lodash')

module.exports = function(grunt) {

    grunt.registerMultiTask('mustache_compile', function(){

        // Get Grunt Options
        let task_options = this.options()
        let output_array = this.files

        // Generator Coroutine function
        let variables_generator = function*(){

            // Merge all variables
            let dynamic_variables = yield task_options.dynamic_variables()
            let variables = _.merge(task_options.variables, dynamic_variables)

            // Define result array
            let result_destinations = []

            mu.root = process.cwd()
            for (mapping of output_array){
                for (source of mapping.src){

                    // Start rendering the file to a stream
                    let render_stream = mu.compileAndRender(source, variables)
                    let destination_array = _.isString(mapping.dest) ? 
                        [mapping.dest] : mapping.dest;

                    for (destination of destination_array){
                        // Output the stream 
                        grunt.file.write(destination, render_stream)

                        // Logs
                        grunt.log.ok(destination)
                        result_destinations.push(destination)
                    }

                }
            }

            // Result
            return result_destinations
        }

        /*
            Main Execution Chain
        */
        let done = this.async()
        Promise
            // Execute the Generator as a Coroutine
            .try(Promise.coroutine(variables_generator))
            // finalize
            .then(done)
            // Catch any error
            .catch( error => {
                grunt.log.error(error)
                done(error)
            })
    })

}