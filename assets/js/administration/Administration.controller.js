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
			{level: 1, text: "Read only"},
			{level: 2, text: "Add expenses"},
			{level: 3, text: "Category admin"}
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

		vm.editPersonalBudget = function(user, add) {
			var title = "Add " + vm.category.name + " personal money for " + user.name;
			var action = " added";
			if (!add) {
				title = "Take back " + vm.category.name + " personal money from " + user.name;
				action = " taken";
			}
			swal({
				title: title,
				type: "input",
				showCancelButton: true,
				closeOnConfirm: false,
				animation: "slide-from-top",
				inputType: "number",
				inputPlaceholder: "Money amount in " + vm.currency
			}, function(inputValue) {
				if (inputValue === false) return false;
				if (inputValue === "" || isNaN(inputValue) || inputValue < 0) {
					swal.showInputError("You need to enter positive value");
					return false;
				}
				if (!add && inputValue > vm.getUserCategory(user).left/vm.rate) {
					swal.showInputError("You can't take back more than there is left");
					return false;
				}
				if (!add) {inputValue = -inputValue};
				UsersService.editUser(user.id, {addPersonalBudget: {id: vm.category.id, budget: Number(inputValue * vm.rate)}}).then(function(res) {
					vm.updateUsers();
					swal("Ok!", Math.abs(inputValue) + " " + vm.currency + action, "success");
				});
			});
		}

		vm.updateRole = function(user) {
			UsersService.editUser(user.id, {setAdminStatus: user.admin}).then(function() {
				vm.updateUsers();
			});
		}

		vm.updateRights = function(user) {
			UsersService.editUser(user.id, {setPermissionLevel: {id: vm.category.id, level: vm.getUserCategory(user).level}}).then(function() {
				vm.updateUsers();
			});
		}

		vm.updateCurrency = function() {
			if (vm.currency == 'USD') {
				vm.rate = $rootScope.exchangeRate;
			}
			else {
				vm.rate = 1;
			}
		}

		vm.updateUsers = function() {
			UsersService.getUsers().then(function(users) {
				vm.users = users || [];
			});
		}

		vm.getUserCategory = function(user) {
			var result = _.find(user.categories, {id: vm.category.id});
			if (!result) {
				var level = 0;
				if (user.admin) { level = 3; }
				user.categories.push({id: vm.category.id, budget: 0, level: level, used: 0});
				return vm.getUserCategory(user);
			}
			return result;
		}
	}
};