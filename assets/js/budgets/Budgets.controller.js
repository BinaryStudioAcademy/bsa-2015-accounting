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

		vm.rawBudgets = [];
		vm.rawExpenses = [];

		vm.budgets = [];
		vm.expenses = [];

		vm.categories = [];
		//vm.year = new Date().getFullYear() + 1;
		vm.years = [];
		//vm.years = [];

		////////create route /years ???
		BudgetsService.getBudgets().then(function(rawBudgets) {
			vm.rawBudgets = rawBudgets;
			vm.rawBudgets.forEach(function(budget) {
				if (vm.years.indexOf(String(budget.year)) < 0) vm.years.push(String(budget.year));
			});

			ExpensesService.getAllExpenses().then(function(rawExpenses) {
				vm.rawExpenses = rawExpenses;
				
				vm.year = vm.years[0];
				vm.updateYear();
			});
			



			
			//vm.years.unshift(+vm.years[0] + 1 + "");

		});

		vm.updateYear = function() {
			vm.budgets = _.filter(vm.rawBudgets, {year: Number(vm.year)});

			vm.expenses = _.filter(vm.rawExpenses, function(expense) {
				return (new Date(expense.time * 1000)).getFullYear() == vm.year;
			});

			vm.annualBudget = 0;
			vm.annualUsed = 0;
			vm.annualDistributed = 0;

			vm.categories = [];
			vm.budgets.forEach(function(budget) {
				vm.annualBudget += budget.budget;
				var subcategories = [];

				var catUsed = 0;

				var catDistributed = 0;

				budget.subcategories.forEach(function(sub) {
					var nameIndex = _.findIndex(budget.categoryId.subcategories, function(s) {
						return s.id === sub.id;
					});

					var subExpenses = _.filter(vm.expenses, {subcategoryId: sub.id});
					
					
					var subUsed = 0;

					subExpenses.forEach(function(subExpense) {
						subUsed += subExpense.price;
					});

					catUsed += subUsed;
					catDistributed += sub.budget;

					var subcategory = {name: budget.categoryId.subcategories[nameIndex].name, budget: sub.budget, used: subUsed}
						subcategories.push(subcategory);
					});



				var category = {name: budget.categoryId.name, budget: budget.budget, subcategories: subcategories, used: catUsed, undistributed: (budget.budget - catDistributed)};
				vm.categories.push(category);
				vm.annualUsed += catUsed;
				vm.annualDistributed += catDistributed;
			});
			vm.annualUndistributed = vm.annualBudget - vm.annualDistributed;
		};

		vm.addBudget = function() {
			var newBud = {
				//creatorId: "",
				year: Number(vm.year),
				//categoryId: "",
				budget: 0,
				subcategories: []
			};
			
			console.log(vm.budgets);
			console.log(vm.categories);

			vm.budgets.push(newBud);
		}

		vm.addCategory = function() {
			var newCat = {
				name: "",
				subcategories: "",
				managers: ""
			};

			vm.categories.push(newCat);
		}

		vm.addSubcategory = function(category) {
			var newSubcat = {
				id: "",
				name: ""
			};

			vm.subcategories.push(newSubcat);
		}
	}
};
