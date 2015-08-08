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
		vm.categories = [];
//add row
  vm.addUser = function() {
    vm.inserted = {
      id: vm.users.length+1,
      name: '',
      budget: '',
      used: null 
    };
    vm.users.push(vm.inserted);
  };
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
