var _ = require('lodash');

module.exports = function(app) {
	app.controller('BudgetsController', BudgetsController);
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3';
	});

	BudgetsController.$inject = ['BudgetsService', 'ExpensesService', 'CategoriesService', 'YearsService'];

	function BudgetsController(BudgetsService, ExpensesService, CategoriesService, YearsService) {
		var vm = this;
//togle list
		vm.hiddenList=[];
		vm.toggleCustom = function (index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};

		vm.rawBudgets = [];
		vm.rawExpenses = [];
		vm.years = [];


		vm.budgets = [];
		vm.expenses = [];
		vm.categories = [];
		vm.annualBudget = 0;
		vm.annualUsed = 0;
		vm.annualDistributed = 0;



		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});


		


		

		vm.calcAnnualBudget = function() {
			var annualBudget = 0;
			for (var i = 0; i < vm.categories.length; i++) {
				annualBudget += Number(vm.categories[i].budget);
			}
			return annualBudget;
		}

		vm.calcAnnualUsed = function() {
			var annualUsed = 0;
			for (var i = 0; i < vm.categories.length; i++) {
				annualUsed += vm.categories[i].used;
			}
			return annualUsed;
		}

		vm.calcAnnualUndistributed = function() {
			var annualUndistributed = 0;
			for (var i = 0; i < vm.categories.length; i++) {
				annualUndistributed += vm.categories[i].undistributed();
			}
			return annualUndistributed;
		}



		vm.updateYear = function() {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				vm.budgets = budgets;
				ExpensesService.getAllExpenses(vm.year).then(function(expenses) {
					vm.expenses = expenses;

					vm.categories = [];
					vm.budgets.forEach(function(budget) {
						vm.annualBudget += budget.budget;
						var subcategories = [];

						var catUsed = 0;


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

							var subcategory = {name: budget.categoryId.subcategories[nameIndex].name, budget: sub.budget, used: subUsed};
							subcategories.push(subcategory);
						});

						var calcUndistributed = function() {
							var distributed = 0;
							for (var i = 0; i < this.subcategories.length; i++) {
								distributed += Number(this.subcategories[i].budget);
							}
							return (this.budget - distributed);
						};

						var category = {name: budget.categoryId.name, budget: budget.budget, subcategories: subcategories, used: catUsed, undistributed: calcUndistributed};
						vm.categories.push(category);

					});
				});
			});


	
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
