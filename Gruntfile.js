/*global module:false*/
module.exports = function(grunt) {

    require('time-grunt')(grunt);


    var pkg = grunt.file.readJSON('package.json');

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,

        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        compass: {
            dist: {
                options: {
                    environment: 'production',
                    force: true
                }
            },
            dev: {
                options: {
                    environment: 'development'
                }
            }
        },

        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                src: [
                    "public/js/leaflet-providers.js",
                    "public/js/config.js",
                    "public/js/my_position.js",
                    "public/js/markers.js",
                    "public/js/refresh.js",
                    "public/js/fuzzy.js",
                    "public/js/search.js",
                    "public/js/main.js"
                ],
                dest: 'public/js/build/' + pkg.name + '.js'
            }
        },

        jshint: {

            all: [
                'Gruntfile.js', 
                'public/js/**/*.js',
            ],
            options: {
                ignores: [
                    'public/**/*.min.js',
                    'public/js/build/*.js',
                    'public/js/leaflet-providers.js'
                ],
                jshintrc: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            }
        },

        uglify: {
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'public/js/build/' + pkg.name + '.min.js'
            }
       }

    });

    // autoload tasks
    require('load-grunt-tasks')(grunt);
};
