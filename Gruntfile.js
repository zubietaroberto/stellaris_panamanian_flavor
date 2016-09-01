module.exports = function(grunt) {

    let mod_name = 'panamanian_flavor'
    let mustache_variables = {
        mod_name: mod_name
    }

    // Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean:['output/'],

        copy: {
            main:{
                files:[
                    // Thumbnail
                    {
                        expand:false,
                        src:['templates/thumbnail.jpg'],
                        dest:`output/${mod_name}/${mod_name}.jpg`
                    },

                    // Translation Strings
                    {
                        expand:true,
                        cwd:'templates/',
                        src:['l_*.yml'],
                        dest:`output/${mod_name}/localisation`,
                        rename: (dest, src) => `${dest}/pty_${src}`
                    }
                ]
            }
        },

        mustache_compile: {
            variables: mustache_variables,
            files:[

                // Descriptor file (2 copies)
                {
                    src:'templates/descriptor.mod.mustache',
                    dest:[
                            `output/${mod_name}.mod`,
                            `output/${mod_name}/descriptor.mod`
                        ]
                },

                // Prescripted Countries
                {
                    src:'templates/species.txt.mustache',
                    dest:[
                            `output/${mod_name}/prescripted_countries/prescripted_countries.txt`
                        ]
                }
            ]
        },

        // Namelist itself
        namelist_compile:{
            src: "templates/namelist.txt.mustache",
            target_dir:`output/${mod_name}/common/name_lists`,
            target_filename:'panamanian.txt'
        }
    })

  // Load Tasks
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')

  //Load Custom Tasks
  grunt.loadTasks('tasks')

  // Register Tasks
  grunt.registerTask('default', ['clean', 'mustache_compile', 'namelist_compile', 'copy'])

}