module.exports = function(app) {
  app.controller('ExpenseFormController', ExpenseFormController);

  ExpenseFormController.$inject = ['ExpensesService'];

  function ExpenseFormController(ExpensesService) {
    var vm = this;

    // Create new expense
    vm.expense = {};
    vm.createExpense = createExpense;

    function createExpense() {
      ExpensesService.createExpense(vm.expense);
      vm.expense = {};
    }
  }
};