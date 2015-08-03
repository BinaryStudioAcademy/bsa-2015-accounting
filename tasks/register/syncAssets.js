module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'sylus:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
