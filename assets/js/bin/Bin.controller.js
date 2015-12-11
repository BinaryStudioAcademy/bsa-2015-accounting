var _ = require('lodash');

module.exports = function(app) {
	app.controller('BinController', BinController);

	BinController.$inject = ['BudgetsService', 'YearsService', 'ExpensesService', '$q'];

	function BinController(BudgetsService, YearsService, ExpensesService, $q) {
		var vm = this;

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			if (!vm.years.length) vm.years = [(new Date().getFullYear())];
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});

		vm.updateYear = function() {
			BudgetsService.getDeletedBudgets(vm.year).then(function(data) {
				vm.deletedStuff = data || [];
			});
		};

		vm.restoreMe = function(id, categoryId, subcategoryId, budget) {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				var existing = _.find(budgets, {category: {id: categoryId}});
				var restorePromise = function() {
					return BudgetsService.editBudget(id, {restore: true});
				};
				var deletePromise = function() {
					return BudgetsService.deleteBudget(existing.id);
				};

				if (subcategoryId) {
					existing = _.find(existing.category.subcategories, {id: subcategoryId});
					restorePromise = function() {
						return BudgetsService.editBudget(id, {restoreSubcategory: {id: subcategoryId, budget: budget}});
					};
					deletePromise = function() {
						return BudgetsService.editBudget(id, {delSubcategory: {id: existing.id}});
					};
				}

				if (existing) {
					if (subcategoryId) {
						var mess = "There already is " + existing.name + " subcategory";
					}
					else {
						var mess = "This will replace existing " + existing.category.name + " budget and all of it's subcategories";
					}
					swal({
						title: "Are you sure?",
						text: mess,
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, pretty sure!",
						closeOnConfirm: true
					}, function() {
						deletePromise().then(function() {
							return restorePromise().then(function() {
								return vm.updateYear();
							});
						});
					});
				}
				else {
					restorePromise().then(function(data) {
						return vm.updateYear();
					});
				}
			});
		};

		//expenses
		vm.expensesQuery = {
			limit: 10,
			sort: "updatedAt desc"
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

			ExpensesService.getDeletedExpenses(vm.expensesQuery).then(function(data) {
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
				vm.expensesSections = [ { title: 'All creation dates', content: vm.expenses } ];
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
					vm.expensesSections = [ { title: 'All creation dates', content: [] } ];
				}
			}
		}

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

		vm.restoreExpense = function(expenseId, expenseName) {
			swal({
				title: "Are you sure?",
				text: "Are you sure want to restore '" + expenseName + "'?",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, pretty sure!",
				closeOnConfirm: true
			}, function() {
				ExpensesService.restoreExpense(expenseId).then(function() {
					vm.updateExpenses();
				});
			});
		}

		vm.updateExpenses();
}