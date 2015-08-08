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

    loadExpenses();

    function loadExpenses() {
      ExpensesService.getExpenses(expensesLimit).then(function(data) {
        vm.expenses = data;
      });
    }

    function loadMoreExpenses() {
      expensesLimit += 10;
      ExpensesService.getExpenses(expensesLimit).then(function(data) {
        vm.expenses = data;
      });
    }

    function deleteExpense(id) {
      ExpensesService.deleteExpense(id).then(function() {
        for(var i = 0; i < vm.expenses.length; i++) {
          if(vm.expenses[i].id === id) {
            vm.expenses.splice(i, 1);
            break;
          }
        }
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
      ExpensesService.getExpensesByFilter(vm.filters).then(function(data) {
        vm.expenses = data;
      });
    }
  }
};