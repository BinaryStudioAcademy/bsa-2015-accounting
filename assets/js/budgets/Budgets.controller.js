var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService', 'YearsService'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService, YearsService) {
		var vm = this;

		//togglig lists
		vm.hiddenList = [];
		vm.toggleCustom = function (index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};

		vm.years = [];
		vm.categories = [];
		vm.expenses = [];

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			if (!vm.years.length) vm.years = [(new Date().getFullYear())];
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});

		vm.updateYear = function() {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				vm.categories = budgets || [];

				vm.annualBudget = 0;
				vm.annualUsed = 0;
				vm.annualUndistributed = 0;

				ExpensesService.getAllExpenses(vm.year).then(function(expenses) {
					vm.expenses = expenses || [];

					vm.categories.forEach(function(category) {
						//category used money amount
						var catUsed = 0;
						var distributed = 0;

						category.subcategories.forEach(function(subcategory) {
							var subExpenses = _.filter(vm.expenses, {subcategoryId: subcategory.id});
							var subUsed = 0;

							subExpenses.forEach(function(subExpense) {
								subUsed += subExpense.price;
							});

							catUsed += subUsed;
							distributed += subcategory.budget;
							subcategory.name = _.find(category.categoryId.subcategories, {id: subcategory.id}).name;
							subcategory.used = subUsed;
						});

						category.name = category.categoryId.name;
						category.used = catUsed;
						category.undistributed = category.budget - distributed;

						vm.annualBudget += category.budget;
						vm.annualUsed += category.used;
						vm.annualUndistributed += category.undistributed;
					});
				});
			});
		};

		vm.createNewBudget = function() {
			vm.years.unshift(vm.years[0] + 1);
			vm.year = String(vm.years[0]);
			vm.updateYear();
		};

		vm.addCategory = function() {
			vm.categories.push({
				name: "",
				budget: 0,
				used: 0,
				subcategories: []
			});
		};

		vm.addSubcategory = function(category) {
			if (category.name !== "") {
				category.subcategories.push({
					name: "",
					budget: 0,
					used: 0
				});
			}
			else swal("Slow down buddy!", "You have to name that category first");
		};

		vm.saveCategoryName = function(data, category) {
			if (data == "") {
				return "You call that a name???";
			}
			else if (data !== category.name) {
				if (category.categoryId) {
					return CategoriesService.editCategory(category.categoryId.id, {name: data});
				}
				else {
					CategoriesService.createCategory({name: data}).then(function(category) {
						BudgetsService.createBudget({year: vm.year, categoryId: category.id}).then(function() {
							return vm.updateYear();
						});
					});
				}
			}
		};

		vm.saveSubcategoryName = function(data, category, subcategory) {
			if (data == "") {
				return "You call that a name???";
			}
			else if (data !== subcategory.name) {
				var newId = vm.getRandomId();
				if (!subcategory.id) {
					category.categoryId.subcategories.push({
						id: newId,
						name: data
					});
				}
				else {
					_.find(category.categoryId.subcategories, {id: subcategory.id}).name = data;
				}
				CategoriesService.editCategory(category.categoryId.id, {subcategories: category.categoryId.subcategories}).then(function() {
					if (subcategory.id) {
						return vm.updateYear();
					}
					else {
						category.subcategories.push({
							id: newId,
							budget: 0
						});
						BudgetsService.editBudget(category.id, {subcategories: category.subcategories}).then(function() {
							return vm.updateYear();
						});
					}
				});
			}
		};

		vm.saveCategoryBudget = function(data, category) {
			if (data == null) {
				return "Maybe you meant 0?";
			}
			if (data < 0) {
				return "Negative budgets not allowed";
			}
			if (data !== category.budget) {
				BudgetsService.editBudget(category.id, {budget: data}).then(function() {
					return vm.updateYear();
				});
			}
		};

		vm.saveSubcategoryBudget = function(data, category, subcategory) {
			if (data == null) {
				return "Maybe you meant 0?";
			}
			if (data < 0) {
				return "Negative budgets not allowed";
			}
			if (data !== subcategory.budget) {
				_.find(category.subcategories, {id: subcategory.id}).budget = data;
				BudgetsService.editBudget(category.id, {subcategories: category.subcategories}).then(function() {
					return vm.updateYear();
				});
			}
		};

		vm.deleteCategory = function(category) {
			if (!category.categoryId) {
				var i = vm.categories.indexOf(category);
				vm.categories.splice(i, 1);
			}
			else {
				BudgetsService.deleteBudget(category.id).then(function() {
					return vm.updateYear();
				});
			}
		};

		vm.deleteSubcategory = function(category, subcategory) {
			if (!subcategory.id) {
				var i = category.subcategories.indexOf(subcategory);
				category.subcategories.splice(i, 1);
			}
			//else {
			//	BudgetsService.deleteBudget(budgetId).then(function() {
			//		return vm.updateYear();
			//	});
			//}
		};

		vm.getRandomId = function() {
			return String(Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 9999999);
		};

	}
};