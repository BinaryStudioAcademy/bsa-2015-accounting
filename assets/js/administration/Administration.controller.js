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

		//var usersPromise = UsersService.getUsers();
		//var categoriesPromise = CategoriesService.getCategories();

		vm.updateUsers();
		CategoriesService.getCategories().then(function(categories) {
			vm.categories = categories || [];
		});

		//$q.all([usersPromise, categoriesPromise]).then(function(data) {
		//	vm.users = data[0] || [];
		//	console.log("hey, we r vm.users", vm.users);
		//	vm.categories = data[1] || [];
//
		//	//vm.users.forEach(function(user) {
		//	//	var local = localData(user.serverUserId);
		//	//	if (local) user.id = local.id;
		//	//	user.admin = local ? local.admin : false;
		//	//	user.budget = local ? local.budget : 0;
		//	//	user.categories = local ? local.categories : [];
		//	//});
		//	vm.currency = 'UAH';
		//	vm.rate = 1;
		//	vm.category = vm.categories[0];
		//});

		vm.editPersonalBudget = function(user, add) {
			var title = "Add personal money for " + user.name;
			var action = " added";
			if (!add) {
				title = "Take back personal money from " + user.name;
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
				if (!add && inputValue > user.budget.left/vm.rate) {
					swal.showInputError("You can't take back more than there is left");
					return false;
				}
				if (!add) {inputValue = -inputValue}
				if (user.local) {
					UsersService.editUser(user.id, {editPersonalBudget: Number((inputValue * vm.rate).toFixed(2))}).then(function(res) {
						vm.updateUsers();
						swal("Ok!", Math.abs(inputValue) + " " + vm.currency + action, "success");
					});
				}
				else {
					UsersService.createUser({global_id: user.serverUserId, budget: Number((inputValue * vm.rate).toFixed(2))}).then(function(res) {
						vm.updateUsers();
						swal("Ok!", Math.abs(inputValue) + " " + vm.currency + action, "success");
					});
				}
				
			});
		}

		vm.updateRole = function(user) {
			if (user.local) {
				UsersService.editUser(user.id, {setAdminStatus: user.admin}).then(function() {
					vm.updateUsers();
				});
			}
			else {
				UsersService.createUser({global_id: user.serverUserId, admin: user.admin}).then(function(res) {
					vm.updateUsers();
				});
			}
		}

		vm.updateRights = function(user) {
			if (user.local) {
				UsersService.editUser(user.id, {setPermissionLevel: {id: vm.category.id, level: vm.getUserCategory(user).level}}).then(function() {
					vm.updateUsers();
				});
			}
			else {
				UsersService.createUser({global_id: user.serverUserId, categories: [{id: vm.category.id, level: vm.getUserCategory(user).level}]}).then(function(res) {
					vm.updateUsers();
				});
			}
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
				console.log("hey, we r vm.users", vm.users);
			});
		}

		vm.getUserCategory = function(user) {
			var result = _.find(user.categories, {id: vm.category.id});
			if (!result) {
				var level = 0;
				if (user.admin) { level = 3; }
				user.categories.push({id: vm.category.id, level: level});
				return vm.getUserCategory(user);
			}
			return result;
		}

		//function localData(global_id) {
		//	return _.find(vm.localUsers, {global_id: global_id});
		//}
	}
};