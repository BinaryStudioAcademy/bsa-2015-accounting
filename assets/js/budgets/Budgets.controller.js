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



		vm.changesStatus = false;

		///////////////////vm.deletedCategories = [];
		///////////////////vm.deletedSubcategories = [];

		///////////////////vm.editedCategories = [];
		///////////////////vm.editedSubcategories = [];
		vm.editedBudgets = [];
		vm.deletedBudgets = [];



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
			vm.changesStatus = false;
			vm.editedBudgets = [];
			vm.deletedBudgets = [];

			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				vm.budgets = budgets || [];
				ExpensesService.getAllExpenses(vm.year).then(function(expenses) {
					vm.expenses = expenses || [];

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

							var subcategory = {id: sub.id, name: budget.categoryId.subcategories[nameIndex].name, budget: sub.budget, used: subUsed};
							subcategories.push(subcategory);
						});

						vm.calcUndistributed = function() {
							var distributed = 0;
							for (var i = 0; i < this.subcategories.length; i++) {
								distributed += Number(this.subcategories[i].budget);
							}
							return (this.budget - distributed);
						};

						var category = {budgetId: budget.id, id: budget.categoryId.id, name: budget.categoryId.name, budget: budget.budget, subcategories: subcategories, used: catUsed, undistributed: vm.calcUndistributed};
						vm.categories.push(category);

					});
				});
			});
		};

		vm.editedCatName = function(data, category) {
			//if (data.trim() != category.name.trim()) {
			//	var index = vm.editedCategories.indexOf(category.id);
			//	if (index == -1 && !category.status) {
			//		vm.editedCategories.push(category.id);
			//		vm.changesStatus = true;
			//	}
			//}
			if (data.trim() != category.name.trim()) {
				var index = vm.editedBudgets.indexOf(category.budgetId);
				if (index == -1 && !category.status) {
					vm.editedBudgets.push(category.budgetId);
					vm.changesStatus = true;
				}
			}
		}

		vm.editedCatBud = function(data, category) {
			//if (Number(data) != Number(category.budget)) {
			//	var index = vm.editedCategories.indexOf(category.id);
			//	if (index == -1 && !category.status) {
			//		vm.editedCategories.push(category.id);
			//		vm.changesStatus = true;
			//	}
			//}
			if (Number(data) != Number(category.budget)) {
				var index = vm.editedBudgets.indexOf(category.budgetId);
				if (index == -1 && !category.status) {
					vm.editedBudgets.push(category.budgetId);
					vm.changesStatus = true;
				}
			}
		}

		vm.editedSubcatName = function(data, category, subcategory) {
			//var index = category.subcategories.indexOf(subcategory);
			//if (index == -1) {
			//	alert("Something gone wrong. Subcategory not found");
			//}
			//else {
			//	if (data.trim() != category.subcategories[index].name.trim()) {
			//		var index2 = vm.editedSubcategories.indexOf(subcategory.id);
			//		if (index2 == -1 && !subcategory.status) {
			//			vm.editedSubcategories.push({
			//				cat: category.id,
			//				sub: subcategory.id
			//			});
			//			vm.changesStatus = true;
			//		}
			//	}
			//}
			var index = category.subcategories.indexOf(subcategory);
			if (index == -1) {
				//alert("Something gone wrong. Subcategory not found");
				swal("Something gone wrong!", "Subcategory not found");
			}
			else {
				if (data.trim() != category.subcategories[index].name.trim()) {
					var index2 = vm.editedBudgets.indexOf(category.budgetId);
					if (index2 == -1 && !subcategory.status) {
						vm.editedBudgets.push(category.budgetId);
						vm.changesStatus = true;
					}
				}
			}
		}

		vm.editedSubcatBud = function(data, category, subcategory) {
			//var index = category.subcategories.indexOf(subcategory);
			//if (index == -1) {
			//	alert("Something gone wrong. Subcategory not found");
			//}
			//else {
			//	if (Number(data) != Number(category.subcategories[index].budget)) {
			//		var index2 = vm.editedSubcategories.indexOf(subcategory.id);
			//		if (index2 == -1 && !subcategory.status) {
			//			vm.editedSubcategories.push({
			//				cat: category.id,
			//				sub: subcategory.id
			//			});
			//			vm.changesStatus = true;
			//		}
			//	}
			//}
			var index = category.subcategories.indexOf(subcategory);
			if (index == -1) {
				//alert("Something gone wrong. Subcategory not found");
				swal("Something gone wrong!", "Subcategory not found");
			}
			else {
				if (Number(data) != Number(category.subcategories[index].budget)) {
					var index2 = vm.editedBudgets.indexOf(category.budgetId);
					if (index2 == -1 && !subcategory.status) {
						vm.editedBudgets.push(category.budgetId);
						vm.changesStatus = true;
					}
				}
			}
		}

		vm.createNewBudget = function() {
			vm.years.unshift(vm.years[0] + 1);
			vm.year = String(vm.years[0]);
			vm.updateYear();
			vm.changesStatus = true;
		}




		vm.addCategory = function() {
			var newCat = {
				name: "- unnamed category -",
				budget: 0,
				subcategories: [],
				used: 0,
				managers: [],
				undistributed: vm.calcUndistributed,
				status: "created"
			};
			vm.categories.push(newCat);
			vm.changesStatus = true;
		};

		vm.addSubcategory = function(category) {
			var newSubcat = {
				name: "- unnamed subcategory -",
				budget: 0,
				used: 0,
				status: "created"
			};
			category.subcategories.push(newSubcat);
			vm.changesStatus = true;
		};

		vm.deleteCategory = function(category) {
			//var index = vm.categories.indexOf(category);
			//if (index == -1) {
			//	alert("Something gone wrong. Category not found");
			//}
			//else {
			//	if (!category.status) {
			//		vm.deletedCategories.push(category.id);
			//	}
			//	vm.categories.splice(index, 1);
			//	vm.changesStatus = true;
			//}
			var index = vm.categories.indexOf(category);
			if (index == -1) {
				//alert("Something gone wrong. Category not found");
				swal("Something gone wrong!", "Category not found");
			}
			else {
				if (!category.status) {
					vm.deletedBudgets.push(category.budgetId);
				}
				vm.categories.splice(index, 1);
				vm.changesStatus = true;
			}
		};

		vm.deleteSubcategory = function(category, subcategory) {
			//var index = category.subcategories.indexOf(subcategory);
			//if (index == -1) {
			//	alert("Something gone wrong. Subcategory not found");
			//}
			//else {
			//	if (!category.subcategories[index].status) {
			//		vm.deletedSubcategories.push({
			//			cat: category.id,
			//			sub: subcategory.id
			//		});
			//	}
			//	category.subcategories.splice(index, 1);
			//	vm.changesStatus = true;
			//}
			var index = category.subcategories.indexOf(subcategory);
			if (index == -1) {
				//alert("Something gone wrong. Subcategory not found");
				swal("Something gone wrong!", "Subcategory not found");
			}
			else {
				if (!category.subcategories[index].status) {//////////*****************************************/*/*/*/*/*/*/
					var targetBudget = _.find(vm.budgets, function(budget) {
						return budget.id == category.budgetId;
					});

					var targetSubcategory = _.find(targetBudget.subcategories, function(subcat) {
						return subcat.id == subcategory.id;
					});

					targetSubcategory.deletedBy = "unonymous";

				}
				category.subcategories.splice(index, 1);
				vm.changesStatus = true;
			}
		}

		vm.getRandomInt = function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}


		vm.checkChanges = function() {
			if (vm.changesStatus) {
				swal({
					title: "Are you sure?",
					text: "Changes will be sent to the server!",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, send it!",
					closeOnConfirm: false
				},
				function(){swal("Database updated!", "Well, actually it is not. This feature is not yet implemented :(", "success"); });

				//var confirmation = confirm("Are you sure? Changes will be sent to the server");
				//if (confirmation) {

					////////////////var addedCategories = _.filter(vm.categories, {status: "created"});
////////////////
					////////////////vm.editedBudgets.forEach(function(budget) {
					////////////////	BudgetsService.editBudget(budget.id, budget);
					////////////////});
////////////////
					////////////////vm.deletedBudgets.forEach(function(budget) {
					////////////////	BudgetsService.deleteBudget(budget.id);
					////////////////});
////////////////
					////////////////addedCategories.forEach(function(category) {
					////////////////	console.log("me run");
					////////////////	var formatedSubcategories = [];
					////////////////	category.subcategories.forEach(function(subcategory) {
					////////////////		formatedSubcategories.push({
					////////////////			id: vm.getRandomInt(1111111, 9999999),
					////////////////			budget: subcategory.budget
					////////////////		});
					////////////////	});
					////////////////	BudgetsService.createBudget({
					////////////////		budget: category.budget,
					////////////////		year: vm.year,
					////////////////		categoryId: vm.getRandomInt(1111111, 9999999),
					////////////////		subcategories: formatedSubcategories,
					////////////////		creatorId: "anonymous id"
					////////////////	});
					////////////////});
					


					//var addedSubcategories = [];
					//vm.categories.forEach(function(category) {
					//	var addedSubcats = _.filter(category.subcategories, {status: "created"});
					//	if (addedSubcats.length) {
					//		addedSubcats.forEach(function(addedSubcat) {
					//			if (true) {}
					//			addedSubcategories.push({
					//				cat: category.id,
					//				sub: addedSubcat.id
					//			});
					//		});
					//	}
					//});
					//var addedSubcategories = _.filter(vm.categories, {status: "created"});

					//if (vm.editedSubcategories.length) {
					//	//console.log("edited subcategories: ", vm.editedSubcategories);
					//	vm.editedSubcategories.forEach(function(subcategory) {
					//		var targetBudget = _.find(vm.budgets, function(budget) {
					//			return budget.categoryId == subcategory.cat;
					//		});
//
					//		console.log();
//
					//		BudgetsService.editBudget(targetBudget.id, targetBudget);
					//	})
					//}
					//if (vm.editedCategories.length) {
					//	//console.log("edited categories: ", vm.editedCategories);
//
					//}
					//if (vm.deletedSubcategories.length) {
					//	//console.log("deleted subcategories: ", vm.deletedSubcategories);
//
					//}
					//if (vm.deletedCategories.length) {
					//	//console.log("deleted categories: ", vm.deletedCategories);
//
					//}
					//if (addedCategories.length) {
					//	//console.log("added categories: ", addedCategories);
//
					//}
					//if (addedSubcategories.length) {
					//	//console.log("added subcategories: ", addedSubcategories);
//
					//}
				//}
			}
			else {
				//alert("You have to change something first");
				swal("Nothing to save!", "You have to change something first");
			}
		}
	}
};
