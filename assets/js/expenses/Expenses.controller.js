var swal = require('sweetalert');

module.exports = function(app) {
	app.controller('ExpensesController', ExpensesController);

	ExpensesController.$inject = ['ExpensesService', 'CategoriesService'];

	function ExpensesController(ExpensesService, CategoriesService) {
		var vm = this;

		vm.loadMoreExpenses = loadMoreExpenses;
		vm.deleteExpense = deleteExpense;
		vm.editExpense = editExpense;
		vm.filterExpenses = filterExpenses;
		vm.getExpensesByDate = getExpensesByDate;
		vm.toggleCustom =toggleCustom;
		
		var expensesLimit = 10;
		vm.expenses = [];
		vm.dates = [];

		loadExpenses();
		vm.hiddenList=[];
	 function toggleCustom(index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		};
		function loadExpenses() {
			ExpensesService.getExpenses(expensesLimit).then(function(data) {
				// Find subcategory name
				data.forEach(function(expense) {
					expense.time = new Date(expense.time * 1000).toDateString();
					if(vm.dates.indexOf(String(expense.time)) < 0) vm.dates.push(String(expense.time));

					for(var subcategory in expense.categoryId.subcategories) {
						if(expense.subcategoryId == expense.categoryId.subcategories[subcategory].id) {
							expense.subcategoryName = expense.categoryId.subcategories[subcategory].name;
							break;
						}
					}
				});
				vm.expenses = data;
			});
		}

		function getExpensesByDate(date) {
			var expenses = [];
			vm.expenses.forEach(function(expense) {
				if(date == expense.time) {
					expenses.push(expense);
				}
			});
			return expenses;
		}

		function loadMoreExpenses() {
			expensesLimit += 10;
			loadExpenses();
		}

		function deleteExpense(id, name) {
			swal({
					title: "Are you sure?",
					text: "Are you sure want do delete expense '" + name + "'?",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, delete it!",
					closeOnConfirm: false
				},
				function() {
					ExpensesService.deleteExpense(id).then(function() {
						for(var i = 0; i < vm.expenses.length; i++) {
							if(vm.expenses[i].id === id) {
								vm.expenses.splice(i, 1);
								break;
							}
						}
					});
					swal("Deleted!", "Expense has been deleted.", "success");
				});
		}

		function editExpense(id, data, field) {
			console.log(data);

			var expense = {};
			expense[field] = data;
			ExpensesService.editExpense(id, expense);
		}

		// Filter properties
		vm.filters = {};

		function filterExpenses() {
			ExpensesService.getExpensesByFilter(vm.filters).then(function(data) {
				vm.dates = [];
				data.forEach(function(expense) {
					expense.time = new Date(expense.time * 1000).toDateString();
					if(vm.dates.indexOf(String(expense.time)) < 0) vm.dates.push(String(expense.time));

					for(var subcategory in expense.categoryId.subcategories) {
						if(expense.subcategoryId == expense.categoryId.subcategories[subcategory].id) {
							expense.subcategoryName = expense.categoryId.subcategories[subcategory].name;
							break;
						}
					}
				});
				vm.expenses = data;
			});
		}
vm.categories = [];
vm.subcategories = [];
vm.getSubcategories = getSubcategories;

getCategories();

function getCategories() {
	CategoriesService.getCategories().then(function(data) {
		data.forEach(function (category) {
			vm.categories.push(category);
		});
	});
}

function getSubcategories(categoryModel) {
	console.log(categoryModel);
	if(categoryModel != null) {
		for(var category in vm.categories) {
			if(vm.categories[category].name == categoryModel.name) {
				vm.subcategories = [];
				vm.categories[category].subcategories.forEach(function(subcategory) {
					vm.subcategories.push(subcategory);
				});
				break;
			}
		}
	}
}
	}
};
