module.exports = function(grunt) {

	grunt.config.set('jade', {
		dev: {
			files: [{
				expand: true,
				cwd: 'assets/js/',
				src: ['**/*.jade'],
				dest: 'assets/js/',
				ext: '.html'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jade');
};