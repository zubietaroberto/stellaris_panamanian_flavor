const Promise = require("bluebird")
const _ = require('lodash')
const fs = Promise.promisifyAll(require('fs'))
const mustache = require('mustache')

module.exports = function(grunt) {

    grunt.registerMultiTask('mustache_compile', function(){

        // Get Grunt Options
        let task_options = this.options()
        let output_array = this.files

        // Generator Coroutine function
        let variables_coroutine = Promise.coroutine(function*(){

            // Merge all variables
            let dynamic_variables = yield task_options.dynamic_variables()
            let variables = _.merge(task_options.variables, dynamic_variables)

            // Define result array
            let result_destinations = []

            for (mapping of output_array){
                for (source of mapping.src){

                    // Start rendering the file to a stream
                    let template_raw = yield fs.readFileAsync(source, {encoding:'utf-8'})
                    let text = mustache.render(template_raw, variables)

                    let destination_array = _.isString(mapping.dest) ?
                        [mapping.dest] : mapping.dest;

                    for (destination of destination_array){
                        // Output the stream
                        grunt.file.write(destination, text)

                        // Logs
                        grunt.log.ok(destination)
                        result_destinations.push(destination)
                    }

                }
            }

            // Result
            return result_destinations
        })

        /*
            Main Execution Chain
        */
        let done = this.async()
        Promise
            // Execute the Generator as a Coroutine
            .try(variables_coroutine)
            // finalize
            .then(done)
            // Catch any error
            .catch( error => {
                grunt.log.error(error)
                done(error)
            })
    })

}
