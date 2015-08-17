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
			{level: 0, text: "---no rights---"},
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
				vm.getBudget(user).budget += Number(inputValue * vm.rate);
				UsersService.editUser(user.id, {addPersonalBudget: {id: vm.category.id, budget: Number(inputValue * vm.rate)}});
			});
		}

		vm.updateCategory = function() {
			
		}

		vm.updateRole = function(user) {
			UsersService.editUser(user.id, {setAdminStatus: user.admin});
		}

		vm.updateRights = function(user) {
			console.log(user.id, {setPermissionLevel: {id: vm.category.id, level: vm.getPermission(user).level}});
			UsersService.editUser(user.id, {setPermissionLevel: {id: vm.category.id, level: vm.getPermission(user).level}});
		}

		vm.updateCurrency = function() {
			if (vm.currency == 'USD') {
				vm.rate = $rootScope.exchangeRate;
			}
			else {
				vm.rate = 1;
			}
		}

		vm.getPermission = function(user) {
			var permission = _.find(user.permissions, {id: vm.category.id});
			if (!permission) {
				user.permissions.push({id: vm.category.id, level: 0});
				return vm.getPermission(user);
			}
			return permission;
		}

		vm.getBudget = function(user) {
			var budget = _.find(user.budgets, {id: vm.category.id});
			if (!budget) {
				user.budgets.push({id: vm.category.id, budget: 0, used: 0});
				return vm.getBudget(user);
			}
			return budget;
		}


	}
};