//var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {
	app.controller('AdministrationController', AdministrationController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	AdministrationController.$inject = ['UsersService', 'CategoriesService', 'CurrencyService', '$q', '$rootScope'];

	function AdministrationController(UsersService, CategoriesService, CurrencyService, $q, $rootScope) {
		var vm = this;

		//vm.roles = ['user', 'global admin'];
		vm.permits = [
			{level: 0, text: "no rights"},
			{level: 1, text: "READ"},
			{level: 2, text: "POST"},
			{level: 3, text: "ADMIN"}
		];

		var usersPromise = UsersService.getUsers();
		var categoriesPromise = CategoriesService.getCategories();

		$q.all([usersPromise, categoriesPromise]).then(function(data) {
			vm.users = data[0] || [];
			vm.categories = data[1] || [];

			vm.currency = 'UAH';
			vm.rate = 1;
			vm.category = vm.categories[0];
		});

		vm.addPersonalBudget = function(user) {
			swal({
				title: "Add personal budget for " + user.name + " to use in " + vm.category.name,
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
				if (vm.getUserCategory(user).budget) {
					vm.getUserCategory(user).left += Number(inputValue * vm.rate);
				}
				else {
					user.categories.push({id: vm.category.id, left: Number(inputValue * vm.rate)});
				}
				UsersService.editUser(user.id, {addPersonalBudget: {id: vm.category.id, budget: Number(inputValue * vm.rate)}});
			});
		}

		vm.updateRole = function(user) {
			UsersService.editUser(user.id, {setAdminStatus: user.admin});
		}

		vm.updateRights = function(user) {
			UsersService.editUser(user.id, {setPermissionLevel: {id: vm.category.id, level: vm.getUserCategory(user).level}});
		}

		vm.updateCurrency = function() {
			if (vm.currency == 'USD') {
				vm.rate = $rootScope.exchangeRate;
			}
			else {
				vm.rate = 1;
			}
		}

		vm.getUserCategory = function(user) {
			var result = _.find(user.categories, {id: vm.category.id});
			if (!result) {
				user.categories.push({id: vm.category.id, budget: 0, level: 0, used: 0});
				return vm.getUserCategory(user);
			}
			return result;
		}
	}
};