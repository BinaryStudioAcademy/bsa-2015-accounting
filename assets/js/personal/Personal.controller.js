var swal = require('sweetalert');

module.exports = function(app) {
	app.controller('PersonalController', PersonalController);

	PersonalController.$inject = [
		'PersonalService',
		'CategoriesService',
		'ExpensesService',
		'UsersService',
		'$filter',
		'$rootScope',
		'$q'
	];

	function PersonalController(PersonalService, CategoriesService, ExpensesService, UsersService, $filter, $rootScope, $q) {
		var vm = this;

		vm.currentUser = $rootScope.currentUser;
		//vm.allExpenses = [];
		//vm.dates = [];
		vm.history = [];

		//vm.getExpensesByDate = getExpensesByDate;
		//vm.loadExpenses = loadExpenses;
		//vm.isLoadMore = isLoadMore;
		//vm.deleteExpense = deleteExpense;
		//vm.editExpense = editExpense;

		//vm.hiddenList = [];
		//vm.check = false;
		//vm.toggleAllExpenses = toggleAllExpenses;
		//vm.toggleCustom = toggleCustom;

		//function toggleAllExpenses() {
		//	vm.check = !vm.check;
		//	for(var i = 0; i < vm.allExpenses.length; i++) {
		//		vm.hiddenList[i] = vm.check;
		//	}
		//}

		//function toggleCustom(index) {
		//	vm.hiddenList[index] = !vm.hiddenList[index];
		//}

		//var MAX_LOAD = 10;
		//vm.expensesLimit = MAX_LOAD;

		function getHistory() {
			vm.history = [];
			PersonalService.getPersonalHistory().then(function(data) {
				vm.history = data;
				vm.history.forEach(function(item) {
					item.time = new Date(item.time * 1000);
				});
			});
		}

		//getPersonalExpenses();

		getHistory();
		getUsersBudgets();

		/*function getPersonalExpenses() {
			var personalExpensesPromise = PersonalService.getPersonalExpenses();
			var categoriesPromise = CategoriesService.getCategories();

			$q.all([personalExpensesPromise, categoriesPromise]).then(function(data) {
				vm.allExpenses = data[0];
				vm.categories = data[1];

				if(vm.allExpenses.length != 0 && vm.categories.length != 0) {
					convertDates(vm.allExpenses);
					loadExpenses();
				}
				changeExpenseCurrency();
				getHistory();
				getUsersBudgets();
			});
		}*/

		/*function convertDates(array) {
			array.forEach(function(item) {
				item.time = new Date(item.time * 1000);
				if(vm.dates.indexOf(item.time.toDateString()) < 0) vm.dates.push(item.time.toDateString());
			});
		}*/

		/*function isLoadMore() {
			if(typeof vm.dates != "undefined") {
				if(vm.dates.length <= MAX_LOAD || vm.dates.length == 0) {
					vm.expensesLimit = vm.dates.length;
					return false;
				} else return true;
			}
		}*/

		/*function getExpensesByDate(date) {
			var expenses = [];
			var newDate = new Date(date).toDateString();
			vm.allExpenses.forEach(function(expense) {
				if(newDate == expense.time.toDateString()) {
					expenses.push(expense);
				}
			});
			return expenses;
		}*/

		/*function loadExpenses() {
			// Check for length
			isLoadMore();
			vm.expensesLimit += MAX_LOAD;
		}*/

		/*function deleteExpense(id, name) {
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
						for(var i = 0; i < vm.allExpenses.length; i++) {
							if(vm.allExpenses[i].id === id) {
								vm.allExpenses.splice(i, 1);
								break;
							}
						}
					});
					swal("Deleted!", "Expense has been deleted.", "success");
				});
		}*/

		// Edit properties
		//var expense = {};
		//vm.editExpenseObject = editExpenseObject;
		//vm.getField = getField;
		vm.checkField = checkField;
		vm.currency = ["UAH", "USD"];
		/*
		function editExpenseObject(data, field) {
			expense[field] = data;
		}

		function editExpense(id) {
			ExpensesService.editExpense(id, expense).then(function() {
				getUsersBudgets();
			});
		}

		function getField(fieldId, fieldName) {
			var selected;
			if(fieldName == "category") {
				selected = $filter('filter')(vm.categories, {id: fieldId});
				return selected[0].name;
			} else if(fieldName == "subcategory") {
				selected = $filter('filter')(vm.subcategories, {id: fieldId});
				return selected.length ? selected[0].name : selected.length;
			}
		}*/

		function checkField(field) {
			if(typeof field == "undefined") return "Fill in that field";
			else if(typeof field == "number") {
				if(field < 1) return "Amount should be more than zero";
			}
		}

		// Filter combo boxes
		/*vm.categories = [];
		vm.subcategories = [];
		vm.getSubcategories = getSubcategories;

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
		}*/

		// Income data
		vm.budget = {};
		vm.exchangeRate = $rootScope.exchangeRate;

		function getUsersBudgets() {
			UsersService.getCurrentUser().then(function(user) {
				vm.budget = user.budget;
			});
		}

		vm.changeCurrency = changeCurrency;
		vm.currencyLeftModel = "UAH";
		vm.currencySpentModel = "UAH";
		var currencyExchangeLeftFlag = true;
		var currencyExchangeSpentFlag = true;

		function changeCurrency(moneyType) {
			if(moneyType == "left") {
				if(vm.currencyLeftModel == "USD" && currencyExchangeLeftFlag) {
					vm.budget.left /= vm.exchangeRate;
					currencyExchangeLeftFlag = false;
				} else if(vm.currencyLeftModel == "UAH" && !currencyExchangeLeftFlag) {
					vm.budget.left *= vm.exchangeRate;
					currencyExchangeLeftFlag = true;
				}
			} else {
				if(vm.currencySpentModel == "USD" && currencyExchangeSpentFlag) {
					vm.budget.used /= vm.exchangeRate;
					currencyExchangeSpentFlag = false;
				} else if(vm.currencySpentModel == "UAH" && !currencyExchangeSpentFlag) {
					vm.budget.used *= vm.exchangeRate;
					currencyExchangeSpentFlag = true;
				}
			}
		}

		// Money form
		vm.isShowTitle = false;

		vm.showTitle = showTitle;
		function showTitle(isShow) {
			vm.isShowTitle = isShow;
		}

		vm.newMoney = {
			money: 0,
			currency: vm.currency[0]
		};

		vm.processMoney = processMoney;
		function processMoney(add) {
			// Check permissions
			if($rootScope.currentUser.max_level > 1 || $rootScope.currentUser.admin) {
				var addTakeWord = "add";
				var toFromWord = "to";
				var addedTookWord = "added";
				if(!add) {
					addTakeWord = "give back";
					toFromWord = "from";
					addedTookWord = "gave back";
				}
				// Ok
				swal({
						title: "Are you sure?",
						text: "Are you sure want to " + addTakeWord + " " + vm.newMoney.money + " "
						+ vm.newMoney.currency + " " + toFromWord + " your personal budget?",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, " + addTakeWord + " it!",
						closeOnConfirm: false
					},
					function() {
						var newBudget = 0;
						if(vm.newMoney.currency == "USD") {
							newBudget = vm.newMoney.money * $rootScope.exchangeRate;
						} else newBudget = vm.newMoney.money;

						if(!add && newBudget > vm.budget.left) {
							swal.showInputError("You can't give back more than there is left");
							return false;
						}

						if(!add) newBudget = -newBudget;

						if ($rootScope.currentUser.id) {
							UsersService.editUser($rootScope.currentUser.id, {editPersonalBudget: newBudget}).then(function() {
								getUsersBudgets();
								getHistory();
							});
						}
						else {
							UsersService.createUser({global_id: $rootScope.currentUser.global_id, budget: newBudget}).then(function() {
								getUsersBudgets();
								getHistory();
							});
						}

						//vm.changeCurrency('left');
						//vm.changeCurrency('spent');

						//UsersService.editUser($rootScope.currentUser.id,
						//	{editPersonalBudget: newBudget}).then(function() {
						//		getUsersBudgets();
						//		getHistory();
						//	});

						swal("Ok!", "You " + addedTookWord + " " + vm.newMoney.money + " "
							+ vm.newMoney.currency + " " + toFromWord + " your personal budget", "success");
					});
			} else {
				// No permissions
				swal("Cancelled", "You have no permissions", "error");
			}
		}

		vm.editNewMoneyObject = editNewMoneyObject;
		function editNewMoneyObject(data, field) {
			vm.newMoney[field] = data;
		}

		// Income money table
		vm.isCollapsedMoneyTable = true;
		vm.changeMoneyText = changeMoneyText;
		vm.moneyButtonText = "Show";
		function changeMoneyText() {
			vm.moneyButtonText = vm.moneyButtonText == "Show" ? "Hide" : "Show";
		}

		// Sort
		vm.sort = sort;
		var orderBy = $filter('orderBy');
		vm.sortedExpenses = [];
		vm.sortType = false;
		function sort(predicate, reverse) {
			vm.sortedExpenses = vm.allExpenses;
			// Converting to USD
			if(predicate == "currencySort") {
				vm.sortedExpenses.forEach(function(expense) {
					if(expense.currency == "UAH") {
						expense.currencySort = expense.price / $rootScope.exchangeRate;
					} else expense.currencySort = expense.price;
				});
			}
			vm.sortedExpenses = orderBy(vm.sortedExpenses, predicate, reverse);
		}

		// Currency exchange
		vm.currencyModel = "UAH";

		vm.changeExpenseCurrency = changeExpenseCurrency;
		function changeExpenseCurrency() {
			if(vm.currencyModel == "USD") {
				vm.allExpenses.forEach(function(expense) {
					if(expense.currency == "UAH") {
						expense.newPrice = expense.price / $rootScope.exchangeRate;
					} else expense.newPrice = expense.price;
				});
			} else if(vm.currencyModel == "UAH") {
				vm.allExpenses.forEach(function(expense) {
					if(expense.currency == "USD") {
						expense.newPrice = expense.price * $rootScope.exchangeRate;
					} else expense.newPrice = expense.price;
				});
			}
		}

		//---------------------------- mine
		vm.expensesQuery = {
			limit: 10,
			sort: "time desc"
		};

		vm.currencies = ['UAH', 'USD'];
		vm.currencyE = 'Original';

		vm.allowedToEdit = function(expense) {
			var access = _.find($rootScope.currentUser.categories, function(cat) {
				return cat.id === expense.category.id;
			});
			access = access && access.level > 1;
			return access && $rootScope.currentUser.global_id === expense.creator.global_id;
		};

		vm.timeToDate = function(time) {
			return new Date(time * 1000);
		};

		vm.updateExpenses = function() {
			vm.editingStatus = false;

			for (var property in vm.expensesQuery) {
				if (vm.expensesQuery.hasOwnProperty(property) && !vm.expensesQuery[property]) {
					delete vm.expensesQuery[property];
				}
			}

			PersonalService.getPersonalExpenses(vm.expensesQuery).then(function(data) {
				vm.expenses = data;
				updateSections();
			});
		};

		vm.loadMoreExpenses = function(val) {
			vm.expensesQuery.limit += val;
			vm.expensesQuery.limit = Math.min(vm.expensesQuery.limit, 999999);
			vm.updateExpenses();
		};

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
				if (vm.expensesSections.length === 0) {
					vm.expensesSections = [ { title: 'All dates', content: [] } ];
				}
			}
		}

		vm.getDisplayPrice = function(expense) {
			if (vm.currencyE === 'Original' || vm.currencyE === expense.currency) {
				return expense.price;
			}
			return expense.altPrice;
		};

		vm.getDisplayCurrency = function(expense) {
			if (vm.currencyE === 'Original') {
				return expense.currency;
			}
			return vm.currencyE;
		};

		vm.getSortingStatus = function(param) {
			if (vm.expensesQuery.sort.indexOf(param) > -1) {
				return vm.expensesQuery.sort.slice(param.length + 1) === 'desc' ? 1 : -1;
			}
			return 0;
		};

		vm.toggleSorting = function(param) {
			if (vm.expensesQuery.sort.indexOf(param) > -1) {
				vm.expensesQuery.sort = param + (vm.expensesQuery.sort.slice(param.length + 1) === 'desc' ? ' asc' : ' desc');
			}
			else {
				vm.expensesQuery.sort = param + ' desc';
			}
			vm.updateExpenses();
		};

		vm.updateExpense = function(expense) {
			var newData = {
				name: expense.name,
				categoryId: expense.category.id,
				subcategoryId: expense.subcategory.id,
				price: expense.price,
				currency: expense.currency,
				description: expense.description || ""
			};
			ExpensesService.editExpense(expense.id, newData).then(function() {
				vm.updateExpenses();
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
						swal("Deleted!", expense.name + " has been moved to the recovery bin.", "success");
					});
				});
		};

		vm.checkName = function(name) {
			if (name == "") {
				return "You call that a name???";
			}
		};

		vm.checkPrice = function(price) {
			if (price == null) {
				return "Maybe you meant 0?";
			}
			if (price < 0) {
				return "Negative budgets not allowed";
			}
		};

		vm.getSubcategories = function(id) {
			var cat =_.find(vm.categories, function(category) {
				return category.id === id;
			});
			return cat ? cat.subcategories : [];
		};

		vm.updateSubcategories = function(id) {
			vm.subcategories = vm.getSubcategories(id);
		};

		vm.checkCategory = function(id) {
			if (id == "" || null || undefined) {
				return "Nope, something's wrong";
			}
		};

		vm.checkSubcategory = function(data) {
			var subcategories = _.find(vm.categories, { id: data.categoryId }).subcategories;
			if (!_.find(subcategories, { id: data.subcategoryId })) {
				swal("Error", "Something wrong with subcategory", "error");
				return "Nope, something's wrong";
			}
		};

		vm.updateExpenses();

		var usersPromise = UsersService.getUsers();
		var categoriesPromise = CategoriesService.getCategories();
		vm.users = [];
		vm.categories = [];
		vm.expenses = [];

		$q.all([usersPromise, categoriesPromise]).then(function(data) {
			vm.users = data[0] || [];
			vm.categories = data[1] || [];
		});
	}
};
