var swal = require('sweetalert');

module.exports = function(app) {
  app.controller('ExpenseFormController', ExpenseFormController);

  ExpenseFormController.$inject = ['ExpensesService', '$rootScope'];

  function ExpenseFormController(ExpensesService, $rootScope) {
    var vm = this;

    // Create new expense
    vm.expense = {};
    vm.date = new Date();
    vm.createExpense = createExpense;

    function createExpense(categoryModel, subcategoryModel) {
      // Setting id's
      vm.expense.categoryId = categoryModel.id;
      vm.expense.subcategoryId = subcategoryModel.id;
      // Convert time to timestamp
      vm.expense.time = Math.round(new Date(vm.date).getTime() / 1000);

      // Posting
      ExpensesService.createExpense(vm.expense).then(function() {
        vm.expense.time = new Date(vm.expense.time * 1000).toDateString();
        delete vm.expense['categoryId'];
        vm.expense.categoryId = {};
        vm.expense.categoryId.name = categoryModel.name;
        vm.expense.subcategoryName = subcategoryModel.name;

        $rootScope.$emit('new-expense', vm.expense);
        vm.expense = {};
        swal("Successfully added!", "You added new expense!", "success");
      });
    }

    // Categories, subcategories for the post form
    vm.categories = [];
    vm.subcategories = [];
    vm.getSubcategories = getSubcategories;

    getCategories();

    function getCategories() {
      ExpensesService.getCategories().then(function(data) {
        data.forEach(function(category) {
          vm.categories.push(category);
        });
      });
    }

    function getSubcategories(categoryModel) {
      for(var category in vm.categories) {
        if(vm.categories[category].id == categoryModel.id) {
          vm.subcategories = [];
          vm.categories[category].subcategories.forEach(function(subcategory) {
            vm.subcategories.push(subcategory);
          });
          break;
        }
      }
    }

    vm.getCategoryBudget = getCategoryBudget;

    function getCategoryBudget(categoryId, year) {
      var expenses = [];
      ExpensesService.getAllExpenses(year).then(function(data) {
        data.forEach(function(expense) {
          if(expense.categoryId == categoryId) {
            expenses.push(expense);
          }
        });

        var budgetLeft = 0;
        expenses.forEach(function(expense) {
          budgetLeft += expense.price;
        });
        return budgetLeft;
      });
    }
  }
};

