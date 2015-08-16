//var swal = require('sweetalert');
//var _ = require('lodash');
//var objectId = require('../../../config/objectId');

module.exports = function(app) {
	app.controller('AdministrationController', AdministrationController);
	//app.run(function(editableOptions) {
	//	editableOptions.theme = 'bs3';
	//});

	AdministrationController.$inject = ['UsersService', 'CategoriesService', '$q'];

	function AdministrationController(UsersService, CategoriesService, $q) {
		var vm = this;

		var usersPromise = UsersService.getUsers();
		var categoriesPromise = CategoriesService.getCategories();

		$q.all([usersPromise, categoriesPromise]).then(function(data) {
			vm.users = data[0] || [];
			vm.categories = data[1] || [];
		});

	}
};