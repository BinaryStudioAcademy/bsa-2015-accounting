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

    // Expenses section
    vm.loadAllExpenses = loadAllExpenses;
    vm.loadExpenses = loadExpenses;
    vm.isLoadMore = isLoadMore;
    vm.getExpensesByDate = getExpensesByDate;
    vm.toggleCustom = toggleCustom;

    var MAX_LOAD = 10;
    vm.expensesLimit = MAX_LOAD;

    vm.deletedExpenses = [];
    vm.dates = [];

    loadAllExpenses();

    vm.hiddenList = [];
    vm.check = false;
    vm.toggleAllExpenses = toggleAllExpenses;

    function toggleAllExpenses() {
      vm.check = !vm.check;

      for(var i = 0; i < vm.deletedExpenses.length; i++) {
        vm.hiddenList[i] = vm.check;
      }
    }

    function toggleCustom(index) {
      vm.hiddenList[index] = !vm.hiddenList[index];
    }

    function loadAllExpenses() {
      ExpensesService.getDeletedExpenses().then(function(data) {
        vm.deletedExpenses = data;
        convertDates(vm.deletedExpenses);
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
      vm.deletedExpenses.forEach(function(expense) {
        if(newDate == expense.time.toDateString()) {
          expenses.push(expense);
        }
      });
      return expenses;
    }

    vm.restoreExpense = restoreExpense;
    function restoreExpense(expenseId, expenseName) {
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
          loadAllExpenses();
        });
      });
    }
	}
};
