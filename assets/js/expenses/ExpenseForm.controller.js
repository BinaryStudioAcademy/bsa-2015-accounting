var swal = require('sweetalert');

module.exports = function(app) {
  app.controller('ExpenseFormController', ExpenseFormController);

  ExpenseFormController.$inject = ['ExpensesService', '$rootScope', 'BudgetsService', '$filter'];

  function ExpenseFormController(ExpensesService, $rootScope, BudgetsService, $filter) {
    var vm = this;

    // Create new expense
    vm.expense = {};
    vm.date = new Date();
    vm.createExpense = createExpense;

    vm.currentUser = $rootScope.currentUser;
    vm.exchangeRate = $rootScope.exchangeRate;

    vm.budgets = [];
    getBudgets();
    function getBudgets() {
      BudgetsService.getBudgets(vm.date.getFullYear()).then(function(data) {
        vm.budgets = data;
      });
    }

    function createExpense(categoryModel, subcategoryModel) {
      // Setting id's
      vm.expense.categoryId = categoryModel.id;
      vm.expense.subcategoryId = subcategoryModel.id;
      vm.expense.creatorId = vm.currentUser.id;
      // Convert time to timestamp
      vm.expense.time = Math.round(new Date(vm.date).getTime() / 1000);
      // Personal
      if(!vm.expense.personal) delete vm.expense.personal;

      // Posting
      ExpensesService.createExpense(vm.expense).then(function() {
        vm.expense.time = new Date(vm.expense.time * 1000).toDateString();
        delete vm.expense['categoryId'];
        vm.expense.category = {};
        vm.expense.category.name = categoryModel.name;
        vm.expense.subcategory = {};
        vm.expense.subcategory.name = subcategoryModel.name;
        vm.expense.creator = {};
        vm.expense.creator.name = vm.currentUser.name;

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
      vm.leftBudget = 0;
      vm.expense.personal = false;

      if(typeof categoryModel != "undefined") {
        for(var category in vm.categories) {
          if(vm.categories[category].id == categoryModel.id) {
            vm.subcategories = [];
            vm.categories[category].subcategories.forEach(function(subcategory) {
              vm.subcategories.push(subcategory);
            });
            break;
          }
        }
        setLeftBudget(categoryModel);
      } else vm.subcategories = [];
    }

    vm.leftBudget = 0;
    vm.leftSubcategoryBudget = 0;
    vm.setPersonalLeftBudget = setPersonalLeftBudget;

    function setPersonalLeftBudget(categoryModel) {
      var budg = $filter('filter')(vm.currentUser.budgets, {id: categoryModel.id});
      if(budg.length != 0 && vm.expense.personal) {
        vm.leftBudget = budg[0].used;
      } else {
        setLeftBudget(categoryModel);
      }
    }

    vm.setLeftBudget = setLeftBudget;

    function setLeftBudget(categoryModel) {
      if(!vm.expense.personal) {
        var budget = $filter('filter')(vm.budgets, {category: {id: categoryModel.id}});
        vm.leftBudget = budget[0].category.used / vm.exchangeRate;
      } else vm.leftBudget = 0;
    }

    vm.setLeftSubcategoryBudget = setLeftSubcategoryBudget;

    function setLeftSubcategoryBudget(categoryModel, subcategoryModel) {
      if(!vm.expense.personal && subcategoryModel) {
        var budget = $filter('filter')(vm.budgets, {category: {id: categoryModel.id}});
        var subcategory = $filter('filter')(budget[0].category.subcategories, {id: subcategoryModel.id});
        if(subcategory.length != 0) vm.leftSubcategoryBudget = subcategory[0].used / vm.exchangeRate;
        else vm.leftSubcategoryBudget = 0;
      } else vm.leftSubcategoryBudget = 0;
    }
  }
};

