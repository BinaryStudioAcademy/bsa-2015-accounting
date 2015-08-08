var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService) {
		var vm = this;
//togle list
    vm.hiddenList=[];
    vm.toggleCustom = function (index) {
        vm.hiddenList[index] = !vm.hiddenList[index];
    };
		vm.expenses = [];
		vm.categories = [];

		BudgetsService.getBudgets().then(function(budgets) {
			budgets.forEach(function(budget) {
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
		});
	}
};
