module.exports = function(app) {
  app.controller('ExpensesController', ExpensesController);

  ExpensesController.$inject = ['ExpensesService'];

  function ExpensesController(ExpensesService) {
    var vm = this;

    vm.loadMoreExpenses = loadMoreExpenses;
    vm.deleteExpense = deleteExpense;
    vm.editExpense = editExpense;
    vm.filterExpenses = filterExpenses;

    var expensesLimit = 10;
    vm.expenses = [];
    vm.expenses = ExpensesService.getExpenses(expensesLimit);

    function loadMoreExpenses() {
      expensesLimit += 10;
      ExpensesService.getExpenses(expensesLimit).$promise.then(function(data) {
        vm.expenses = data;
      });
    }

    function deleteExpense(id) {
      ExpensesService.deleteExpense(id).$promise.then(function() {
        vm.expenses = ExpensesService.getExpenses(expensesLimit);
      });
    }

    // Edit properties
    vm.expense = {};

    function editExpense(id) {
      ExpensesService.editExpense(id, vm.expense);
    }

    // Filter properties
    vm.filters = {};

    function filterExpenses() {
      ExpensesService.getExpensesByFilter(vm.filters).$promise.then(function(data) {
        vm.expenses = data;
      });
    }
  }
};
