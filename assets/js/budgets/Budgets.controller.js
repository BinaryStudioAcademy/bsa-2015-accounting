var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService) {
		var vm = this;
//togle list
		vm.hiddenList=[];
		vm.toggleCustom = function (index) {
				vm.hiddenList[index] = !vm.hiddenList[index];
		};
		vm.expenses = [];
		vm.rawBudgets = [];
		vm.budgets = [];
		vm.categories = [];
		//vm.year = new Date().getFullYear() + 1;
		vm.years = [];
		//vm.years = [];

		////////create route /years ???
		BudgetsService.getBudgets().then(function(budgets) {
			vm.rawBudgets = budgets;
			budgets.forEach(function(budget) {
				if (vm.years.indexOf(String(budget.year)) < 0) vm.years.push(String(budget.year));
			});

			vm.year = vm.years[0];
			vm.updateYear();
			//vm.years.unshift(+vm.years[0] + 1 + "");

			//ExpensesService.getRequest(expensesIndex, expensesCount).then(function(expenses) {
			//	vm.expenses = expenses;
			//});
		});

		vm.updateYear = function() {
			vm.budgets = _.filter(vm.rawBudgets, {year: Number(vm.year)});

			vm.budgetSum = 0;
			vm.categories = [];
			vm.budgets.forEach(function(budget) {
				vm.budgetSum += budget.budget;
				var subcategories = [];
				budget.subcategories.forEach(function(sub) {
					var nameIndex = _.findIndex(budget.categoryId.subcategories, function(s) {
						return s.id === sub.id;
					});
					var subcategory = {name: budget.categoryId.subcategories[nameIndex].name, budget: sub.budget}
					subcategories.push(subcategory);
				});
				var category = {name: budget.categoryId.name, budget: budget.budget, subcategories: subcategories, used: 'USED*'};
				vm.categories.push(category);
			});
		};

	
	}
};
