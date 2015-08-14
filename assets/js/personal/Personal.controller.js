module.exports = function(app) {
  app.controller('PersonalController', PersonalController);

  PersonalController.$inject = ['PersonalService'];

  function PersonalController(PersonalService) {
    var vm = this;
    vm.expenses = [];
    vm.dates = [];
    vm.getExpensesByDate = getExpensesByDate;

    vm.hiddenList = [];
    vm.toggleCustom = toggleCustom;
    function toggleCustom(index) {
      vm.hiddenList[index] = !vm.hiddenList[index];
    }

    var MAX_LOAD = 10;
    var startExpensesLimit = 0;
    var expensesLimit = MAX_LOAD;

    getPersonalExpenses();

    function getPersonalExpenses() {
      PersonalService.getPersonalExpenses().then(function(data) {
        vm.expenses = data;
        convertDates(vm.expenses);
        //loadExpenses();
      });
    }

    function convertDates(array) {
      array.forEach(function(item) {
        item.time = new Date(item.time * 1000).toDateString();
        if(vm.dates.indexOf(String(item.time)) < 0) vm.dates.push(String(item.time));
      });
    }

    function isLoadMore() {
      if(typeof vm.expenses != "undefined") {
        if(vm.expenses.length <= MAX_LOAD && vm.expenses.length != 0) {
          startExpensesLimit = 0;
          expensesLimit = vm.expenses.length;
          return false;
        } else return true;
      }
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

    function loadExpenses() {
      // Check for length
      isLoadMore();

      for(var i = startExpensesLimit; i < expensesLimit; i++) {
        // Push dates
        if(vm.dates.indexOf(String(vm.expenses[i].time)) < 0) vm.dates.push(String(vm.expenses[i].time));
      }

      startExpensesLimit += MAX_LOAD;
      expensesLimit += MAX_LOAD;
    }
  }
};
