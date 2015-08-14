var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService', 'YearsService', 'UsersService', '$q'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService, YearsService, UsersService, $q) {
		var vm = this;

		//togglig lists
		vm.hiddenList = [];
		vm.toggleCustom = function (index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};

		vm.years = [];
		vm.budgets = [];
		vm.expenses = [];
		vm.categoriesList = [];

		vm.user = {
			id: "unknown id",
			name: "unknown name"
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
			var expensesPromise = ExpensesService.getAllExpenses(vm.year);

			//var userPromise = UsersService.getCurrentUser();

			return $q.all([categoriesPromise, budgetsPromise, expensesPromise]).then(function (data) {
				vm.categoriesList = data[0] || [];
				vm.budgets = data[1] || [];
				vm.expenses = data[2] || [];

				//vm.user = data[3] || {id: "unknown id", name: "unknown name"};
				//console.log(vm.user);

				vm.annualBudget = 0;
				vm.annualUsed = 0;
				vm.annualUndistributed = 0;

				vm.budgets.forEach(function(budget) {
					var catUsed = 0;
					var distributed = 0;

					budget.category.subcategories.forEach(function(subcategory) {
						if (!subcategory.deletedBy) {
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
						}
					});

					budget.category.used = catUsed;
					budget.category.undistributed = budget.category.budget - distributed;

					vm.annualBudget += budget.category.budget;
					vm.annualUsed += budget.category.used;
					vm.annualUndistributed += budget.category.undistributed;
				});
			});
		};

		vm.subcategoriesAutocomplete = function(category, subcategory) {
			if (subcategory && !subcategory.id) {
				return _.difference(_.pluck(_.find(vm.categoriesList, {name: category.name}).subcategories, "name"),
				_.pluck(_.filter(category.subcategories, function(subcat) {
					return !subcat.deletedBy;
				}), "name"));
			}
			return [];
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
					var forbiddenList = _.find(vm.categoriesList, {id: category.id}).subcategories;
					flag = _.find(forbiddenList, {name: data});
				}
				else {
					var forbiddenList = _.filter(category.subcategories, function(subcat) {
						return !subcat.deletedBy;
					});
					flag = _.find(forbiddenList, {name: data});
				}
			}
			else if (data !== category.name) {
				if (category.id) {
					flag = _.find(vm.categoriesList, function(cat) {
						return cat.name == data;
					});
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
			if (budget.id) {
				BudgetsService.deleteBudget(budget.id).then(function () {
					return vm.updateYear();
				});
			}
			else {
				vm.budgets.splice(vm.budgets.indexOf(budget), 1);
			}
		};

		vm.deleteSubcategory = function(budget, subcategory) {
			if (subcategory.id) {
				var subcategories = [];
				budget.category.subcategories.forEach(function(subcat) {
					if (subcat.id) {
						var sub = {id: subcat.id, budget: subcat.budget};
						if (subcat.deletedBy) {
							sub.deletedBy = subcat.deletedBy;
						}
						subcategories.push(sub);
					}
				});
				_.find(subcategories, {id: subcategory.id}).deletedBy = vm.user.id;
				BudgetsService.editBudget(budget.id, {subcategories: subcategories}).then(function () {
					return vm.updateYear();
				});
			}
			else {
				budget.category.subcategories.splice(budget.category.subcategories.indexOf(subcategory), 1);
			}
		};

		vm.sendData = function(budget, subcategory) {
			if (subcategory) {
				var fullSubategoriesList = _.find(vm.categoriesList, {id: budget.category.id}).subcategories;
				if (!subcategory.id) {
					var existing = _.find(fullSubategoriesList, {name: subcategory.name});
					if (existing) {
						subcategory.id = existing.id;
						var subcategories = [];
						budget.category.subcategories.forEach(function(subcat) {
							if (subcat.id) {
								var sub = {id: subcat.id, budget: subcat.budget};
								if (subcat.deletedBy) {
									sub.deletedBy = subcat.deletedBy;
								}
								subcategories.push(sub);
							}
						});
						return BudgetsService.editBudget(budget.id, {subcategories: subcategories});
					}
					subcategory.id = vm.getRandomId();
					fullSubategoriesList.push({
						id: subcategory.id,
						name: subcategory.name
					});
				}
				_.find(fullSubategoriesList, {id: subcategory.id}).name = subcategory.name;
				var categoriesPromise = CategoriesService.editCategory(budget.category.id, {subcategories: fullSubategoriesList});
				var subcategories = [];
				budget.category.subcategories.forEach(function(subcat) {
					if (subcat.id) {
						var sub = {id: subcat.id, budget: subcat.budget};
						if (subcat.deletedBy) {
							sub.deletedBy = subcat.deletedBy;
						}
						subcategories.push(sub);
					}
				});
				var budgetsPromise = BudgetsService.editBudget(budget.id, {subcategories: subcategories});
				return $q.all([categoriesPromise, budgetsPromise]).then(function () {
					return vm.updateYear();
				});
			}
			else {
				if (budget.category.id) {
					var categoriesPromise = CategoriesService.editCategory(budget.category.id, {name: budget.category.name});
					var budgetsPromise = BudgetsService.editBudget(budget.id, {category: {id: budget.category.id, budget: budget.category.budget}});

					return $q.all([categoriesPromise, budgetsPromise]).then(function () {
						return vm.updateYear();
					});
				}
				else {
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
			}
		};

		vm.getRandomId = function() {
			return String(Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 9999999);
		};
	}
};