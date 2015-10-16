var swal = require('sweetalert');
var _ = require('lodash');
var objectId = require('../../../config/objectId');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'CategoriesService', 'YearsService', '$q'];

	function BudgetsController(BudgetsService, CategoriesService, YearsService, $q) {
		var vm = this;

		//togglig lists
		vm.hiddenList = [];
		vm.toggleCustom = function (index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			if (!vm.years.length) vm.years = [(new Date().getFullYear())];
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});

		vm.updateYear = function() {
			var categoriesPromise = CategoriesService.getCategories();
			var budgetsPromise = BudgetsService.getBudgets(vm.year);

			return $q.all([categoriesPromise, budgetsPromise]).then(function (data) {
				vm.categoriesList = data[0] || [];
				vm.budgets = data[1] || [];

				vm.annualBudget = 0;
				vm.annualUsed = 0;
				vm.annualUndistributed = 0;

				vm.budgets.forEach(function(budget) {
					vm.annualBudget += budget.category.budget;
					vm.annualUsed += budget.category.used;
					vm.annualUndistributed += budget.category.undistributed;
				});
			});
		};

		vm.subcategoriesAutocomplete = function(category, subcategory) {
			if (subcategory.id) {
				return [];
			}
			return _.difference(_.pluck(_.find(vm.categoriesList, {name: category.name}).subcategories, "name"),
			_.pluck(category.subcategories, "name"));
		};

		vm.categoriesAutocomplete = function(category) {
			if (category.id) {
				return [];
			}
			var fullList = [];
			vm.budgets.forEach(function(budget) {
				fullList.push(budget.category.name);
			});
			return _.difference(_.pluck(vm.categoriesList, "name"), fullList);
		};

		vm.createNewBudget = function() {
			vm.years.unshift(vm.years[0] + 1);
			vm.year = String(vm.years[0]);
			vm.updateYear();
		};

		vm.addBudget = function() {
			vm.budgets.push({
				category: {
					budget: 0,
					name: "",
					used: 0,
					subcategories: []
				}
			});
		};

		vm.addSubcategory = function(category) {
			if (category.name !== "") {
				category.subcategories.push({
					budget: 0,
					name: "",
					used: 0
				});
			}
			else swal("Slow down buddy!", "You have to name that category first");
		};

		vm.checkName = function(data, category, subcategory) {
			if (data == "") {
				return "You call that a name???";
			}
			var flag = false;
			if (subcategory && data !== subcategory.name) {
				if (subcategory.id) {
					flag = _.find(_.find(vm.categoriesList, {id: category.id}).subcategories, {name: data});
				}
				else {
					flag = _.find(category.subcategories, {name: data});
				}
			}
			else if (data !== category.name) {
				if (category.id) {
					flag = _.find(vm.categoriesList, {name: data});
				}
				else {
					flag = _.find(vm.budgets, function(budget) {
						return budget.category.name == data;
					});
				}
			}
			if (flag) {
				return "There already is " + data;
			}
		};

		vm.checkBudget = function(data) {
			if (data == null) {
				return "Maybe you meant 0?";
			}
			if (data < 0) {
				return "Negative budgets not allowed";
			}
		};

		vm.deleteBudget = function(budget) {
			swal({
				title: "Are you sure?",
				text: "You're about to delete " + budget.category.name,
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				closeOnConfirm: true
			}, function() {
				if (budget.id) {
					BudgetsService.deleteBudget(budget.id).then(function () {
						vm.updateYear();
						swal("Deleted!", budget.category.name + " has been moved to the recovery bin.", "success");
					});
				}
				else {
					vm.budgets.splice(vm.budgets.indexOf(budget), 1);
				}
			});
		};

		vm.deleteSubcategory = function(budget, subcategory) {
			swal({
				title: "Are you sure?",
				text: "You're about to delete " + subcategory.name,
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				closeOnConfirm: true
			}, function() {
				if (subcategory.id) {
					BudgetsService.editBudget(budget.id, {delSubcategory: {id: subcategory.id}}).then(function () {
						vm.updateYear();
						swal("Deleted!", subcategory.name + " has been moved to the recovery bin.", "success");
					});
				}
				else {
					budget.category.subcategories.splice(budget.category.subcategories.indexOf(subcategory), 1);
				}
			});
		};

		vm.getUserCategory = function(user, category) {
			var result = _.find(user.categories, {id: category.id});
			if (!result) {
				user.categories.push({id: category.id, level: 0});
				return vm.getUserCategory(user, category);
			}
			return result;
		};

		vm.sendData = function(budget, subcategory) {
			if (subcategory) {
				if (!subcategory.id) {
					var existing = _.find(_.find(vm.categoriesList, {id: budget.category.id}).subcategories, {name: subcategory.name});
					if (existing) {
						return BudgetsService.editBudget(budget.id, {addSubcategory: {id: existing.id, budget: subcategory.budget}}).then(function() {
							return vm.updateYear();
						});
					}
					else {
						subcategory.id = objectId.ObjectId();
						var budgetsPromise = BudgetsService.editBudget(budget.id, {addSubcategory: {id: subcategory.id, budget: subcategory.budget}});
						var categoriesPromise = CategoriesService.editCategory(budget.category.id, {addSubcategory: {id: subcategory.id, name: subcategory.name}});
					}
				}
				else {
					var budgetsPromise = BudgetsService.editBudget(budget.id, {setSubBudget: {id: subcategory.id, budget: subcategory.budget}});
					var categoriesPromise = CategoriesService.editCategory(budget.category.id, {setSubName: {id: subcategory.id, name: subcategory.name}});
				}
				return $q.all([categoriesPromise, budgetsPromise]).then(function () {
					return vm.updateYear();
				});
			}
			else {
				if (!budget.category.id) {
					var existing = _.find(vm.categoriesList, {name: budget.category.name});
					if (existing) {
						BudgetsService.createBudget({year: vm.year, category: { id: existing.id, budget: budget.category.budget}}).then(function() {
							return vm.updateYear();
						});
					}
					else {
						CategoriesService.createCategory({name: budget.category.name}).then(function(category) {
							BudgetsService.createBudget({year: vm.year, category: { id: category.id, budget: budget.category.budget}}).then(function() {
								return vm.updateYear();
							});
						});
					}
				}
				else {
					var categoriesPromise = CategoriesService.editCategory(budget.category.id, {setName: {name: budget.category.name}});
					var budgetsPromise = BudgetsService.editBudget(budget.id, {setBudget: {budget: budget.category.budget}});
					return $q.all([categoriesPromise, budgetsPromise]).then(function () {
						return vm.updateYear();
					});
				}
			}
		};
	}
};