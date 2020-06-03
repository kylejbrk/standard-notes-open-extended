module.exports = function(grunt) {
  grunt.initConfig({

     concat: {
       options: {
         separator: ' ',
       },

       redactor: {
         src: [
           'redactor/src/redactor.js',
           'redactor/plugins/**/*.min.js'
         ],
         dest: 'dist/redactor.js',
       },

      dist: {
        src: [
          'dist/redactor.min.js',
          'dist/app.min.js',
        ],
        // Optional for consumer whether they want this combined files. Can also import individual files.
        dest: 'dist/dist.min.js',
      },

       css: {
         src: [
           'redactor/src/redactor.min.css',
           'dist/app.css',
           'redactor/plugins/inlinestyle/inlinestyle.min.css',
           'node_modules/filesafe-embed/dist/dist.css'
         ],
         dest: 'dist/dist.css'
       }
     },

     uglify: {
       redactor: {
         src: ['dist/redactor.js'],
         dest: 'dist/redactor.min.js'
       }
    },

  });

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', [
    'concat:redactor', 'uglify:redactor',
    'concat:dist',
    'concat:css'
  ]);
};
