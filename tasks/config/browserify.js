var _ = require('lodash');

var libs = getNPMPackageIds();

module.exports = function(grunt) {

	grunt.config.set('browserify', {
		vendor: {
			src: [],
			dest:'.tmp/public/accounting/js/app-libs.js',
			options: {
				require: libs
			}
		},

		client: {
			src: 'assets/js/index.js',
			dest: '.tmp/public/accounting/js/app.js',
			options: {
				external: libs
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
};

/**
* Helper function(s)
*/
function getNPMPackageIds() {
	var packageManifest = {};
	try {
		packageManifest = require('../../package.json');
	} catch (e) {
		// does not have a package.json manifest
	}
	return _.keys(packageManifest.devDependencies) || [];
}

// function getBowerPackageIds() {
// 	var bowerManifest = {};
// 	try {
// 		bowerManifest = require('./bower.json');
// 	} catch (e) {
// 		// does not have a bower.json manifest
// 	}
// 	return _.keys(bowerManifest.dependencies) || [];
// }
