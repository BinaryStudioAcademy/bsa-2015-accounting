//var swal = require('sweetalert');
//var _ = require('lodash');
//var objectId = require('../../../config/objectId');

module.exports = function(app) {
	app.controller('AdministrationController', AdministrationController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	AdministrationController.$inject = ['UsersService', 'CategoriesService', '$q'];

	function AdministrationController(UsersService, CategoriesService, $q) {
		var vm = this;

		vm.roles = ['manager', 'global admin'];

		var usersPromise = UsersService.getUsers();
		var categoriesPromise = CategoriesService.getCategories();

		$q.all([usersPromise, categoriesPromise]).then(function(data) {
			vm.users = data[0] || [];
			vm.categories = data[1] || [];

			vm.currency = ['UAH', 'USD'];
			vm.category = vm.categories[0];

			vm.users.forEach(function(user) {
				if (user.role === "admin") {
					user.role = "global admin"
				}
			});
		});

		vm.addPersonalBudget = function(user) {
			swal({
				title: "Add personal budget for " + user.name + " to use in " + vm.category,
				//text: "This action is irrevertable",
				type: "input",
				showCancelButton: true,
				closeOnConfirm: false,
				animation: "slide-from-top",
				inputType: "number",
				inputPlaceholder: "Money amount to add in " + vm.currency
			}, function(inputValue) {
				if (inputValue === false) return false;
				if (inputValue === "" || isNaN(inputValue) || inputValue < 0) {
					swal.showInputError("You need to enter positive value");
					return false;
				}
				swal("Nice!", inputValue + " " + vm.currency + " added", "success");
			});
		}

		vm.updateCategory = function() {
			console.log(vm.category);
		}

		vm.updateCurrency = function() {
			console.log(vm.category);
		}

	}
};