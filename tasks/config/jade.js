module.exports = function(grunt) {

	grunt.config.set('jade', {
		dev: {
			files: [{
				expand: true,
        flatten: true,
				cwd: 'assets/js/',
				src: ['**/*.jade'],
				dest: '.tmp/public/accounting/templates',
				ext: '.html'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jade');
};
