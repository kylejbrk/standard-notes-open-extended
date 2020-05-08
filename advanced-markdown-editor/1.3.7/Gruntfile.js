module.exports = function(grunt) {

  grunt.initConfig({

  watch: {
    js: {
      files: ['src/**/*.js'],
      tasks: ['concat:app', 'babel', 'browserify', 'concat:lib', 'concat:dist'],
      options: {
        spawn: false,
      },
    },
    css: {
      files: ['src/main.scss', 'src/css/*.css'],
      tasks: ['sass','concat:css', 'copy'],
      options: {
        spawn: false,
      },
    }
  },

  sass: {
    dist: {
      options: {
       style: 'expanded',
       sourcemap: 'none'
     },
      files: {
        'dist/app.css': 'src/main.scss'
      }
    }
  },

   babel: {
        app: {
            files: {
                'dist/app.js': ['dist/app.js']
            }
        }
    },

    browserify: {
      dist: {
        files: {
          'dist/app.js': 'dist/app.js'
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      app: {
        src: [
          'src/**/*.js',
        ],
        dest: 'dist/app.js',
      },

      lib: {
        src: [
          'vendor/*.js',
          "node_modules/easymde/dist/easymde.min.js",
          "node_modules/highlightjs/highlight.pack.min.js",
          "node_modules/sn-components-api/dist/dist.js"
        ],
        dest: 'dist/lib.js',
      },

      dist: {
        src: ['dist/lib.js', 'dist/app.js'],
        dest: 'dist/dist.js',
      },

      css: {
        options: {
          separator: '',
        },
        src: [
          'node_modules/easymde/dist/easymde.min.css',
          'dist/app.css',
          'node_modules/sn-stylekit/dist/stylekit.css',
          'vendor/css/*.css'
        ],
        dest: 'dist/dist.css',
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'vendor/fonts',
            src: '**/*',
            dest: 'dist/fonts'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', [
    'concat:app',
    'babel',
    'browserify',
    'concat:lib',
    'concat:dist',
    'sass',
    'concat:css',
    'copy'
  ]);
};
