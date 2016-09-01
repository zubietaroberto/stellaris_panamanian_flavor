module.exports = function(grunt) {

    let mod_name = 'panamanian_flavor'

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
                    },

                    // Descriptor
                    {

                    }
                ]
            }
        }
    })

  // Load Tasks
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')

  // Register Tasks
  grunt.registerTask('default', ['clean', 'copy'])

}