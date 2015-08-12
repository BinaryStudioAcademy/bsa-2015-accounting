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

						budget.subcategories.forEach(function(subcategory) {
							var subExpenses = _.filter(vm.expenses.subcategory, {id: subcategory.id});
							var subUsed = 0;

							subExpenses.forEach(function(subExpense) {
								subUsed += subExpense.price;
							});

							catUsed += subUsed;
							distributed += subcategory.budget;
							subcategory.used = subUsed;
						});

						//budget.name = budget.categoryId.name;
						//budget.used = catUsed;
						//budget.undistributed = budget.budget - distributed;

						//vm.annualBudget += budget.budget;
						//vm.annualUsed += budget.used;
						//vm.annualUndistributed += budget.undistributed;
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
					console.log("subcategory", subcategory);
					category.categoryId.subcategories.push({
						id: newId,
						name: subcategory.name
					});
					console.log("category.categoryId.subcategories", category.categoryId.subcategories);
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

		//vm.saveCategoryName = function(data, category) {
		//	if (data == "") {
		//		return "You call that a name???";
		//	}
		//	else if (data !== category.name) {
		//		if (category.categoryId) {
		//			return CategoriesService.editCategory(category.categoryId.id, {name: data});
		//		}
		//		else {
		//			CategoriesService.createCategory({name: data}).then(function(category) {
		//				BudgetsService.createBudget({year: vm.year, categoryId: category.id}).then(function() {
		//					return vm.updateYear();
		//				});
		//			});
		//		}
		//	}
		//};
//
		//vm.saveSubcategoryName = function(data, category, subcategory) {
		//	if (data == "") {
		//		return "You call that a name???";
		//	}
		//	else if (data !== subcategory.name) {
		//		var newId = vm.getRandomId();
		//		if (!subcategory.id) {
		//			category.categoryId.subcategories.push({
		//				id: newId,
		//				name: data
		//			});
		//		}
		//		else {
		//			_.find(category.categoryId.subcategories, {id: subcategory.id}).name = data;
		//		}
		//		CategoriesService.editCategory(category.categoryId.id, {subcategories: category.categoryId.subcategories}).then(function() {
		//			if (subcategory.id) {
		//				return vm.updateYear();
		//			}
		//			else {
		//				subcategory.id = newId;
		//				BudgetsService.editBudget(category.id, {subcategories: category.subcategories}).then(function() {
		//					return vm.updateYear();
		//				});
		//			}
		//		});
		//	}
		//};
//
		//vm.saveCategoryBudget = function(data, category) {
		//	if (data == null) {
		//		return "Maybe you meant 0?";
		//	}
		//	if (data < 0) {
		//		return "Negative budgets not allowed";
		//	}
		//	if (data !== category.budget) {
		//		BudgetsService.editBudget(category.id, {budget: data}).then(function() {
		//			return vm.updateYear();
		//		});
		//	}
		//};
//
		//vm.saveSubcategoryBudget = function(data, category, subcategory) {
		//	if (data == null) {
		//		return "Maybe you meant 0?";
		//	}
		//	if (data < 0) {
		//		return "Negative budgets not allowed";
		//	}
		//	if (data !== subcategory.budget) {
		//		_.find(category.subcategories, {id: subcategory.id}).budget = data;
		//		BudgetsService.editBudget(category.id, {subcategories: category.subcategories}).then(function() {
		//			return vm.updateYear();
		//		});
		//	}
		//};
//
		//vm.deleteCategory = function(category) {
		//	if (!category.categoryId) {
		//		var i = vm.budgets.indexOf(category);
		//		vm.budgets.splice(i, 1);
		//	}
		//	else {
		//		BudgetsService.deleteBudget(category.id).then(function() {
		//			return vm.updateYear();
		//		});
		//	}
		//};
//
		//vm.deleteSubcategory = function(category, subcategory) {
		//	if (!subcategory.id) {
		//		var i = category.subcategories.indexOf(subcategory);
		//		category.subcategories.splice(i, 1);
		//	}
		//	//else {
		//	//	BudgetsService.deleteBudget(budgetId).then(function() {
		//	//		return vm.updateYear();
		//	//	});
		//	//}
		//};

		vm.getRandomId = function() {
			return String(Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 9999999);
		};

	}
};