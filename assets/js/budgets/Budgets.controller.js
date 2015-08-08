module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService) {
		var vm = this;

		vm.expenses = [];
		vm.categories = [];

		BudgetsService.getBudgets().then(function(budgets) {
			console.log(budgets);
			budgets.forEach(function(budget) {
				var category = {name: budget.categoryId.name, budget: budget.budget, subcategories: budget.subcategories};
				vm.categories.push(category);
			});
		});
		// vm.expenses = ExpensesService.getExpenses();
		// vm.categories = CategoriesService.getCategories();
	}
};
