var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {

	app.controller('ExpensesController', ExpensesController);

	ExpensesController.$inject = ['ExpensesService', '$rootScope', 'CategoriesService', '$filter', '$scope', 'CurrencyService'];

	function ExpensesController(ExpensesService, $rootScope, CategoriesService, $filter, $scope, CurrencyService) {
		var vm = this;

		//vm.expensesQuery = {
		//	name,
		//	categoryId,
		//	subcategoryId,
		//	creatorId,
		//	start,
		//	end,
		//	limit,
		//	sort
		//};

		vm.expensesQuery = {limit: 10, sort: 'time desc'};
		vm.currencies = ["UAH", "USD"];
		
		vm.updateExpenses = function() {
			ExpensesService.getExpenses(vm.expensesQuery).then(function(data) {
				vm.expenses = data;
				updateSections();
			});
		}

		vm.loadMoreExpenses = function() {
			vm.expensesQuery.limit += 10;
			vm.updateExpenses();
		}

		vm.timeToDate = function(time) {
			return new Date(time * 1000);
		}

		function updateSections() {
			if (vm.expensesQuery.sort.indexOf('time') < 0) {
				vm.expensesSections = [ { title: 'All dates', content: vm.expenses } ];
			}
			else {
				vm.expensesSections = [];
				vm.expenses.forEach(function(expense) {
					var date = vm.timeToDate(expense.time).toDateString();
					if (!_.find(vm.expensesSections, { 'title': date })) {
						vm.expensesSections.push({
							title: date,
							content: _.filter(vm.expenses, function(expense) {
								var expenseDate = vm.timeToDate(expense.time).toDateString();
								return expenseDate === date;
							})
						});
					}
				});
			}
		}

		vm.getSortingStatus = function(param) {
			if (vm.expensesQuery.sort.indexOf(param) > -1) {
				return vm.expensesQuery.sort.slice(param.length + 1) === 'desc' ? 1 : -1;
			}
			return 0;
		}

		vm.toggleSorting = function(param) {
			if (vm.expensesQuery.sort.indexOf(param) > -1) {
				vm.expensesQuery.sort = param + (vm.expensesQuery.sort.slice(param.length + 1) === 'desc' ? ' asc' : ' desc');
			}
			else {
				vm.expensesQuery.sort = param + ' desc';
			}
			vm.updateExpenses();
		}

		vm.updateExpense = function(expense) {
			var newData = {
				name: expense.name,
				categoryId: expense.category.id,
				subcategoryId: expense.subcategory.id,
				price: expense.price,
				currency: expense.currency
			};
			ExpensesService.editExpense(expense.id, newData).then(function() {
				changeCurrency();
			});
		};

		vm.deleteExpense = function(expense) {
			swal({
					title: "Are you sure?",
					text: "You're about to delete " + expense.name,
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, delete it!",
					closeOnConfirm: false
				},
				function() {
					ExpensesService.deleteExpense(expense.id).then(function() {
						vm.updateExpenses();
					});
				});
		};

		vm.checkName = function(data) {
			if (data == "") {
				return "You call that a name???";
			}
		};

		vm.checkPrice = function(data) {
			if (data == null) {
				return "Maybe you meant 0?";
			}
			if (data < 0) {
				return "Negative budgets not allowed";
			}
		};

		vm.getSubcategories(id) = function(data) {
			return _.find(vm.categories, function(category) {
				return category.id === id;
			}).subcategories;
		};

		CategoriesService.getCategories().then(function(data) {
			vm.categories = data;
		});
		vm.updateExpenses();


		/*
		vm.loadAllExpenses = loadAllExpenses;
		vm.loadExpenses = loadExpenses;
		vm.isLoadMore = isLoadMore;
		vm.deleteExpense = deleteExpense;
		vm.editExpense = editExpense;
		vm.getExpensesByDate = getExpensesByDate;
		vm.toggleCustom = toggleCustom;

		var MAX_LOAD = 10;
		vm.expensesLimit = MAX_LOAD;

		vm.allExpenses = [];
		vm.dates = [];

		loadAllExpenses();

		vm.hiddenList = [];
		vm.check = false;
		vm.toggleAllExpenses = toggleAllExpenses;

		CurrencyService.getExchangeRates().then(function(data) {
			vm.exchangeRates = data;
		});

		function getExchangeRate(time) {
			var rate = _.find(vm.exchangeRates, function(exchangeRate) {
				return compareDays(time, exchangeRate.time);
			});
			return rate ? rate.rate : $rootScope.exchangeRate;
		}

		function compareDays(time1, time2) {
			var date1 = new Date(time1 * 1000);
			var date2 = new Date(time2 * 1000);
			return (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate());
		}

		function toggleAllExpenses() {
			vm.check = !vm.check;
			for(var i = 0; i < vm.allExpenses.length; i++) {
				vm.hiddenList[i] = vm.check;
			}
		}

		function toggleCustom(index) {
			vm.hiddenList[index] = !vm.hiddenList[index];
		}

		function loadAllExpenses() {
			ExpensesService.getExpenses().then(function(data) {
				vm.allExpenses = data;
				convertDates(vm.allExpenses);
				changeCurrency();
				loadExpenses();
			});
		}

		function convertDates(array) {
			array.forEach(function(item) {
				item.time = new Date(item.time * 1000);
				if(vm.dates.indexOf(item.time.toDateString()) < 0) vm.dates.push(item.time.toDateString());
			});
		}

		function isLoadMore() {
			if(typeof vm.dates != "undefined") {
				if(vm.dates.length <= MAX_LOAD || vm.dates.length == 0) {
					vm.expensesLimit = vm.dates.length;
					return false;
				} else return true;
			}
		}

		function loadExpenses() {
			// Check for length
			isLoadMore();
			vm.expensesLimit += MAX_LOAD;
		}

		function getExpensesByDate(date) {
			var expenses = [];
			var newDate = new Date(date).toDateString();
			vm.allExpenses.forEach(function(expense) {
				if(newDate == expense.time.toDateString()) {
					expenses.push(expense);
				}
			});
			return expenses;
		}

		// Excel table
		vm.pageTitleEquals = pageTitleEquals;
		vm.pushList = pushList;

		vm.pageTitle = [];
		vm.turnPush = false;
		function pushList(bool) {
			return vm.turnPush = bool;
		}

		function pageTitleEquals(filteredExpenses) {
			if(vm.turnPush) {
				$scope.$watch('filteredExpenses', function() {
					vm.pageTitle = filteredExpenses;
					vm.turnPush = false
				});
			} else {
				vm.pageTitle = [];
				$scope.$watch('filteredExpenses', function() {
					vm.pageTitle.push(filteredExpenses[0]);
				});
			}
		}

			var mystyle = {
				sheetid: 'Expenses',
				headers: true
			};

		vm.exportData = function () {
			alasql('SELECT time, name, price, currency, category->name, subcategory->name, creator->name, description  INTO XLSX("Expen.xlsx",?) FROM ?',[mystyle,vm.pageTitle]);
		};


		// On new expense
		$rootScope.$on('new-expense', function(event, args) {
			if(vm.dates.indexOf(args.time.toDateString()) < 0) vm.dates.unshift(args.time.toDateString());
			vm.allExpenses.unshift(args);
			changeCurrency();
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
						loadAllExpenses();
						swal("Deleted!", "Expense has been deleted.", "success");
					});
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
			ExpensesService.editExpense(id, expense).then(function() {
				changeCurrency();
			});
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
				vm.categories = data;
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

		// Sort
		vm.sort = sort;
		var orderBy = $filter('orderBy');
		vm.sortedExpenses = [];
		function sort(predicate, reverse) {
			vm.sortedExpenses = vm.allExpenses;
			// Converting to USD
			if(predicate == "currencySort") {
				vm.sortedExpenses.forEach(function(expense) {
					if(expense.currency == "UAH") {
						expense.currencySort = expense.price / getExchangeRate(expense.time.getTime() / 1000);
					} else expense.currencySort = expense.price;
				});
			}
			vm.sortedExpenses = orderBy(vm.sortedExpenses, predicate, reverse);
		}

		// Permissions
		vm.isUserExpense = isUserExpense;
		function isUserExpense(userId, categoryId) {
			if(userId == $rootScope.currentUser.global_id && $rootScope.getPermission(categoryId) > 1
				|| $rootScope.currentUser.admin) {
				return true;
			} else return false;
		}

		// Currency exchange
		vm.currencyModel = "UAH";

		vm.changeCurrency = changeCurrency;
		function changeCurrency() {
			if(vm.currencyModel == "USD") {
				vm.allExpenses.forEach(function(expense) {
					if(expense.currency == "UAH") {
						expense.newPrice = expense.price / getExchangeRate(expense.time.getTime() / 1000);
					} else expense.newPrice = expense.price;
				});
			} else if(vm.currencyModel == "UAH") {
				vm.allExpenses.forEach(function(expense) {
					if(expense.currency == "USD") {
						expense.newPrice = expense.price * getExchangeRate(expense.time.getTime() / 1000);
					} else expense.newPrice = expense.price;
				});
			}
		}
		*/
	}
};