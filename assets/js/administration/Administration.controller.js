//var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {
	app.controller('AdministrationController', AdministrationController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	AdministrationController.$inject = ['UsersService', 'CategoriesService', 'CurrencyService', '$q'];

	function AdministrationController(UsersService, CategoriesService, CurrencyService, $q) {
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
		var ratePromise = CurrencyService.getExchangeRate();

		$q.all([usersPromise, categoriesPromise, ratePromise]).then(function(data) {
			vm.users = data[0] || [];
			vm.categories = data[1] || [];
			//vm.rate = data[2] || 1;
			//console.log(vm.rate);

			vm.currency = 'UAH';
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
			});
		}

		vm.updateCategory = function() {
			//console.log(vm.category.id);
		}

		vm.updateCurrency = function() {
			//console.log(_.find(vm.users[0].permissions, {id: vm.category.id}).read);
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
				user.budgets.push({id: vm.category.id, budget: "not a penny"});
				return vm.getBudget(user);
			}
			return budget;
		}


	}
};