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
				console.log(vm.categories);

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
			//var newCategory = {
			//	name: "New category"
			//}
			//
			//CategoriesService.createCategory(newCategory).then(function(category) {
			//	var newBudget = {
			//		creatorId: "unknown_id",
			//		year: Number(vm.year),
			//		categoryId: category.id,
			//		budget: 0
			//	}
			//	BudgetsService.createBudget(newBudget).then(function(category) {
			//		vm.updateYear();
			//	});
			//});
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
			//var newId = vm.getRandomId();
			//var subcategories = [];
			//category.subcategories.forEach(function(subcategory) {
			//	subcategories.push({
			//		id: subcategory.id,
			//		name: subcategory.name
			//	});
			//});
			//subcategories.push({
			//	id: newId,
			//	name: "New subcategory"
			//});
			//var newCategory = {
			//	subcategories: subcategories
			//}
			//CategoriesService.editCategory(category.categoryId.id, newCategory).then(function(updatedCategory) {
			//	var subcategories = [];
			//	category.subcategories.forEach(function(subcategory) {
			//		subcategories.push({
			//			id: subcategory.id,
			//			budget: subcategory.budget
			//		});
			//	});
			//	subcategories.push({
			//		id: newId,
			//		budget: 0
			//	});
			//	var newBudget = {
			//		subcategories: subcategories
			//	}
			//	BudgetsService.editBudget(category.id, newBudget).then(function(updatedBudget) {
			//		vm.updateYear();
			//	});
			//});
		};

		vm.saveCategoryName = function(data, category) {
		};

		vm.saveSubcategoryName = function(data, category, subcategory) {
		};

		vm.saveCategoryBudget = function(data, category) {
		};

		vm.saveSubcategoryBudget = function(data, category, subcategory) {
		};

		vm.deleteCategory = function(category) {
		};

		vm.deleteSubcategory = function(category, subcategory) {
		};

		vm.getRandomId = function() {
			return String(Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 9999999);
		};

	}
};