module.exports = function(app) {
  app.controller('ExpensesController', ExpensesController);

  ExpensesController.$inject = ['ExpensesService'];

  function ExpensesController(ExpensesService) {
    var vm = this;

    vm.loadMoreExpenses = loadMoreExpenses;
    vm.deleteExpense = deleteExpense;
    vm.editExpense = editExpense;
    vm.filterExpenses = filterExpenses;
    vm.getExpensesByDate = getExpensesByDate;

    var expensesLimit = 10;
    vm.expenses = [];
    vm.dates = [];

    loadExpenses();

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
      ExpensesService.deleteExpense(id).then(function() {
        for(var i = 0; i < vm.expenses.length; i++) {
          if(vm.expenses[i].id === id) {
            vm.expenses.splice(i, 1);
            break;
          }
        }
      });
    }

    function editExpense(id, data, field) {
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
  }
};
