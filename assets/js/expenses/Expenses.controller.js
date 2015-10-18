var swal = require('sweetalert');
var _ = require('lodash');

module.exports = function(app) {

	app.controller('ExpensesController', ExpensesController);

	ExpensesController.$inject = ['ExpensesService', 'CategoriesService', 'UsersService', 'BudgetsService', '$q', '$rootScope', '$scope'];

	function ExpensesController(ExpensesService, CategoriesService, UsersService, BudgetsService, $q, $rootScope, $scope) {
		var vm = this;

		vm.expensesQuery = {
			name: "",
			categoryId: "",
			subcategoryId: "",
			creatorId: "",
			startDate: new Date(new Date().getFullYear(), 0, 1),
			endDate: new Date(new Date().getFullYear(), 11, 31),
			limit: 10,
			sort: "time desc"
		};

		vm.currencies = ['UAH', 'USD'];
		vm.currency = 'Original';

		vm.timeToDate = function(time) {
			return new Date(time * 1000);
		};

		vm.updateExpenses = function() {
			vm.expensesQuery.start = vm.expensesQuery.startDate ? Number((vm.expensesQuery.startDate.getTime() / 1000).toFixed()) : "";
			vm.expensesQuery.end = vm.expensesQuery.endDate ? Number((vm.expensesQuery.endDate.getTime() / 1000).toFixed()) : "";

			for (var property in vm.expensesQuery) {
				if (vm.expensesQuery.hasOwnProperty(property) && !vm.expensesQuery[property]) {
					delete vm.expensesQuery[property];
				}
			}

			ExpensesService.getExpenses(vm.expensesQuery).then(function(data) {
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
			if (vm.currency === 'Original' || vm.currency === expense.currency) {
				return expense.price;
			}
			return expense.altPrice;
		};

		vm.getDisplayCurrency = function(expense) {
			if (vm.currency === 'Original') {
				return expense.currency;
			}
			return vm.currency;
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

		var mystyle = {
			sheetid: 'Expenses',
			headers: true
		};

		vm.getExcelSheet = function () {
			alasql.fn.getDate = vm.timeToDate;
			alasql.fn.getDisplayPrice = function(price, altPrice, currency) {
				if (vm.currency === 'Original' || vm.currency === currency) {
					return price;
				}
				return altPrice;
			};
				alasql.fn.getDisplayCurrency = function(currency) {
					if (vm.currency === 'Original') {
						return currency;
					}
					return vm.currency;
				};
			alasql('SELECT getDate(time) AS Date, category->name AS Category, subcategory->name AS Subcategory, name AS Name, getDisplayPrice(price, altPrice, currency) AS Price, getDisplayCurrency(currency) AS Currency, creator->name AS Creator, description AS Description INTO XLSX("Expenses.xlsx", ?) FROM ?', [mystyle, vm.expenses]);
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

		//Add expense form

		vm.updateAnnualCategories = function() {
			BudgetsService.getBudgets(vm.newExpense.date.getFullYear()).then(function(data) {
				vm.annualCategories = _.map(data, function(budget) {
					return {
						id: budget.category.id,
						name: budget.category.name,
						left: budget.category.budget - budget.category.used,
						subcategories: _.map(budget.category.subcategories, function(subcategory) {
							return {
								id: subcategory.id,
								name: subcategory.name,
								left: subcategory.budget - subcategory.used
							};
						})
					};
				});
			});
		};

		vm.newExpense = { date: new Date(), currency: "UAH" };
		vm.updateAnnualCategories();

		vm.createExpense = function() {
			vm.newExpense.creatorId = $rootScope.currentUser.global_id;
			vm.newExpense.time = Number((vm.newExpense.date.getTime() / 1000).toFixed());
			delete vm.newExpense.date;
			ExpensesService.createExpense(vm.newExpense).then(function() {
				vm.updateExpenses();
				$scope.expenseForm.$setPristine();
				vm.newExpense = { date: new Date(), currency: "UAH" };
			});
		};

		vm.getAnnualCategory = function() {
			return _.find(vm.annualCategories, function(category) {
				return category.id === vm.newExpense.categoryId;
			});
		};

		vm.getAnnualSubcategory = function() {
			return _.find(vm.getAnnualSubcategories(), function(subcategory) {
				return subcategory.id === vm.newExpense.subcategoryId;
			});
		};

		vm.getAnnualSubcategories = function() {
			var cat = vm.getAnnualCategory();
			return cat ? cat.subcategories : [];
		};
	}
};