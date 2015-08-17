var swal = require('sweetalert');

module.exports = function(app) {
	app.controller('ExpensesController', ExpensesController);

	ExpensesController.$inject = ['ExpensesService', '$rootScope', 'CategoriesService', '$filter','$scope'];

	function ExpensesController(ExpensesService, $rootScope, CategoriesService, $filter, $scope) {
		var vm = this;

		vm.loadAllExpenses = loadAllExpenses;
		vm.loadExpenses = loadExpenses;
		vm.isLoadMore = isLoadMore;
		vm.deleteExpense = deleteExpense;
		vm.editExpense = editExpense;
		vm.getExpensesByDate = getExpensesByDate;
		vm.toggleCustom = toggleCustom;

		var MAX_LOAD = 10;
		var startExpensesLimit = 0;
		var expensesLimit = MAX_LOAD;

		vm.allExpenses = [];
		vm.expenses = [];
		vm.dates = [];

		loadAllExpenses();

		//table
		vm.pushList = pushList;
		vm.pageTitleEquals = pageTitleEquals;
		vm.exportData = vm.exportData
				vm.pageTitle = [];
				vm.turnPush = false
				function pushList(bool){

					return vm.turnPush = bool

				}


		function pageTitleEquals(filteredExpenses) {
			if(vm.turnPush){
				$scope.$watch('filteredExpenses', function() {
					vm.pageTitle.push(filteredExpenses[0]);
					vm.turnPush = false
				});
			}else{
				vm.pageTitle = [];
				$scope.$watch('filteredExpenses', function() {
					vm.pageTitle.push(filteredExpenses[0]);
				});
			}
		}

		vm.exportData = function () {
			var mystyle = {
					sheetid: 'My Big Table Sheet',
					headers: true,
					columns: [
						{columnid:'time'},
						{columnid:'name'},
						{columnid:'price'},
						{columnid:'currency'},
						{columnid:'categoryName'},
						{columnid:'subcategoryName'},
						{columnid:'authorName'},
						{columnid:'description'},
					]
			};
			alasql('SELECT time, name, price, currency, categoryName, subcategoryName, authorName, description  INTO XLSX("Expen.xlsx",?) FROM ?',[mystyle,vm.pageTitle]);
		};


		vm.hiddenList = [];
		vm.hiddenList[0] = true;
		function toggleCustom(index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		}

		function loadAllExpenses() {
			ExpensesService.getExpenses().then(function(data) {
				vm.allExpenses = data;
				convertDates(vm.allExpenses);
				loadExpenses();
			});
		}

		function convertDates(array) {
			array.forEach(function(item) {
				item.time = new Date(item.time * 1000).toDateString();
			});
		}

		function isLoadMore() {
			if(typeof vm.allExpenses != "undefined") {
				if(vm.allExpenses.length <= MAX_LOAD && vm.allExpenses.length != 0) {
					startExpensesLimit = 0;
					expensesLimit = vm.allExpenses.length;
					return false;
				} else return true;
			}
		}

		function loadExpenses() {
			// Check for length
			isLoadMore();

			for(var i = startExpensesLimit; i < expensesLimit; i++) {
				// Push dates
				if(vm.dates.indexOf(String(vm.allExpenses[i].time)) < 0) vm.dates.push(String(vm.allExpenses[i].time));

				// Add expense to the common array
				vm.expenses[i] = vm.allExpenses[i];
				vm.expenses[i].categoryName = vm.allExpenses[i].category.name;
				vm.expenses[i].subcategoryName = vm.allExpenses[i].subcategory.name;
				vm.expenses[i].authorName = vm.allExpenses[i].creator.name;
			}

			startExpensesLimit += MAX_LOAD;
			expensesLimit += MAX_LOAD;
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

		// On new expense
		$rootScope.$on('new-expense', function(event, args) {
			if(vm.dates.indexOf(String(args.time)) < 0) vm.dates.unshift(String(args.time));
			vm.expenses.push(args);
		});

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
								vm.allExpenses.splice(i, 1);
								break;
							}
						}
					});
					swal("Deleted!", "Expense has been deleted.", "success");
				});
		}

		// Edit properties
		var expense = {};
		vm.editExpenseObject = editExpenseObject;
		vm.getField = getField;
		vm.checkField = checkField;
		vm.currency = ["UAH", "USD"];

		function editExpenseObject(data, field) {
			expense[field] = data;
		}

		function editExpense(id) {
			ExpensesService.editExpense(id, expense);
		}

		function getField(fieldId, fieldName) {
			var selected;
			if(fieldName == "category") {
				selected = $filter('filter')(vm.categories, {id: fieldId});
				if(selected.length != 0)
				return selected[0].name;
			} else if(fieldName == "subcategory") {
				selected = $filter('filter')(vm.subcategories, {id: fieldId});
				return selected.length ? selected[0].name : selected.length;
			}
		}

		function checkField(field) {
			if(typeof field == "undefined") return "Fill in that field";
		}

		// Filter combo boxes
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
			if(categoryModel != null) {
				for(var category in vm.categories) {
					if(vm.categories[category].id == categoryModel) {
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
