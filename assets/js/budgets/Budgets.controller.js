var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService', 'YearsService', '$q'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService, YearsService, $q) {
		var vm = this;

		//togglig lists
		vm.hiddenList = [];
		vm.toggleCustom = function (index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};

		vm.years = [];
		vm.budgets = [];
		vm.expenses = [];

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			if (!vm.years.length) vm.years = [(new Date().getFullYear())];
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});

		vm.updateYear = function() {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				vm.budgets = budgets || [];

				vm.annualBudget = 0;
				vm.annualUsed = 0;
				vm.annualUndistributed = 0;

				ExpensesService.getAllExpenses(vm.year).then(function(expenses) {
					vm.expenses = expenses || [];

					vm.budgets.forEach(function(budget) {
						//budget used money amount
						var catUsed = 0;
						var distributed = 0;

						budget.category.subcategories.forEach(function(subcategory) {
							var subExpenses = _.filter(vm.expenses, function(expense) {
								return expense.subcategory.id == subcategory.id;
							});
							var subUsed = 0;

							subExpenses.forEach(function(subExpense) {
								subUsed += subExpense.price;
							});

							catUsed += subUsed;
							distributed += subcategory.budget;
							subcategory.used = subUsed;
						});

						budget.category.used = catUsed;
						budget.category.undistributed = budget.category.budget - distributed;

						vm.annualBudget += budget.category.budget;
						vm.annualUsed += budget.category.used;
						vm.annualUndistributed += budget.category.undistributed;
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
			vm.budgets.push({
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

		vm.checkName = function(data, category, subcategory) {
			if (data == "") {
				return "You call that a name???";
			}
			var flag = false;
			if (subcategory && data !== subcategory.name) {
				flag = _.find(category.subcategories, {name: data});
			}
			else if (data !== category.name) {
				flag = _.find(vm.budgets, {name: data});
			}
			if (flag) {
				return "There already is " + data;
			}
		}

		vm.checkBudget = function(data, category, subcategory) {
			if (data == null) {
				return "Maybe you meant 0?";
			}
			if (data < 0) {
				return "Negative budgets not allowed";
			}
		}

		vm.sendData = function(category, subcategory) {
			if (subcategory) {
				if (subcategory.id) {
					_.find(category.categoryId.subcategories, {id: subcategory.id}).name = subcategory.name;
				}
				if (!subcategory.id) {
					var newId = vm.getRandomId();
					subcategory.id = newId;
					category.categoryId.subcategories.push({
						id: newId,
						name: subcategory.name
					});
				}
				var categoriesPromise = CategoriesService.editCategory(category.categoryId.id, {subcategories: category.categoryId.subcategories});
				var budgetsPromise = BudgetsService.editBudget(category.id, {subcategories: category.subcategories});
				return $q.all([categoriesPromise, budgetsPromise]).then(function () {
					return vm.updateYear();
				});
			}
			else {
				if (category.categoryId) {
					var categoriesPromise = CategoriesService.editCategory(category.categoryId.id, {name: category.name});
					var budgetsPromise = BudgetsService.editBudget(category.id, {budget: category.budget});
					return $q.all([categoriesPromise, budgetsPromise]).then(function () {
						return vm.updateYear();
					});
				}
				else {
					CategoriesService.createCategory({name: category.name}).then(function(newCat) {
						BudgetsService.createBudget({year: vm.year, categoryId: newCat.id}).then(function() {
							return vm.updateYear();
						});
					});
				}
			}
		}

		vm.getRandomId = function() {
			return String(Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 9999999);
		};

	}
};