var swal = require('sweetalert');

module.exports = function(app) {
  app.controller('PersonalController', PersonalController);

  PersonalController.$inject = [
    'PersonalService',
    'CategoriesService',
    'ExpensesService',
    'UsersService',
    'CurrencyService',
    '$filter'
  ];

  function PersonalController(PersonalService, CategoriesService, ExpensesService, UsersService, CurrencyService, $filter) {
    var vm = this;

    vm.currentUser = {};
    vm.allExpenses = [];
    vm.expenses = [];
    vm.dates = [];

    vm.getExpensesByDate = getExpensesByDate;
    vm.loadExpenses = loadExpenses;
    vm.isLoadMore = isLoadMore;
    vm.deleteExpense = deleteExpense;
    vm.editExpense = editExpense;

    vm.hiddenList = [];
    vm.hiddenList[0] = true;
    vm.toggleCustom = toggleCustom;
    function toggleCustom(index) {
      vm.hiddenList[index] = !vm.hiddenList[index];
    }

    var MAX_LOAD = 10;
    var startExpensesLimit = 0;
    var expensesLimit = MAX_LOAD;

    getPersonalExpenses();

    function getPersonalExpenses() {
      UsersService.getCurrentUser().then(function(user) {
        vm.currentUser = user;
        getCategories();
        PersonalService.getPersonalExpenses(vm.currentUser.id).then(function(data) {
          vm.allExpenses = data;
          convertDates(vm.allExpenses);
          loadExpenses();
        });
      });
    }

    function convertDates(array) {
      array.forEach(function(item) {
        item.time = new Date(item.time * 1000).toDateString();
      });
    }

    function isLoadMore() {
      if(typeof vm.allExpenses != "undefined") {
        if(vm.allExpenses.length <= MAX_LOAD && vm.allExpenses.length != 0) {
          startExpensesLimit = 0;
          expensesLimit = vm.allExpenses.length;
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
        if(vm.dates.indexOf(String(vm.allExpenses[i].time)) < 0) vm.dates.push(String(vm.allExpenses[i].time));

        // Add expense to the common array
        vm.expenses[i] = vm.allExpenses[i];
        vm.expenses[i].categoryName = vm.allExpenses[i].category.name;
        vm.expenses[i].subcategoryName = vm.allExpenses[i].subcategory.name;
        vm.expenses[i].authorName = vm.allExpenses[i].creator.name;
      }

      startExpensesLimit += MAX_LOAD;
      expensesLimit += MAX_LOAD;
    }

    function deleteExpense(id, name) {
      swal({
          title: "Are you sure?",
          text: "Are you sure want do delete expense '" + name + "'?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
        },
        function() {
          ExpensesService.deleteExpense(id).then(function() {
            for(var i = 0; i < vm.expenses.length; i++) {
              if(vm.expenses[i].id === id) {
                vm.expenses.splice(i, 1);
                vm.allExpenses.splice(i, 1);
                break;
              }
            }
          });
          swal("Deleted!", "Expense has been deleted.", "success");
        });
    }

    // Edit properties
    var expense = {};
    vm.editExpenseObject = editExpenseObject;
    vm.getField = getField;
    vm.checkField = checkField;
    vm.currency = ["UAH", "USD"];

    function editExpenseObject(data, field) {
      expense[field] = data;
    }

    function editExpense(id) {
      ExpensesService.editExpense(id, expense).then(function() {
        updateBudgets(expense.categoryId);
      });
    }

    function getField(fieldId, fieldName) {
      var selected;
      if(fieldName == "category") {
        selected = $filter('filter')(vm.categories, {id: fieldId});
        return selected[0].name;
      } else if(fieldName == "subcategory") {
        selected = $filter('filter')(vm.subcategories, {id: fieldId});
        return selected.length ? selected[0].name : selected.length;
      }
    }

    function checkField(field) {
      if(typeof field == "undefined") return "Fill in that field";
    }

    // Filter combo boxes
    vm.categories = [];
    vm.subcategories = [];
    vm.getSubcategories = getSubcategories;

    function getCategories() {
      CategoriesService.getCategories().then(function(data) {
        data.forEach(function (category) {
          vm.categories.push(category);
        });
        getUsersBudgets();
      });
    }

    function getSubcategories(categoryModel) {
      if(categoryModel != null) {
        for(var category in vm.categories) {
          if(vm.categories[category].id == categoryModel) {
            vm.subcategories = [];
            vm.categories[category].subcategories.forEach(function(subcategory) {
              vm.subcategories.push(subcategory);
            });
            break;
          }
        }
      }
    }

    // Income data
    vm.budgets = [];
    vm.exchangeRate = 0;

    function getUsersBudgets() {
      CurrencyService.getExchangeRate().then(function(exchangeRate) {
        vm.exchangeRate = exchangeRate[0].rate;
        vm.currentUser.budgets.forEach(function(item) {
          var category = $filter('filter')(vm.categories, {id: item.categoryId});
          item.categoryId = category[0].name;
          item.left = calculateLeftBudget(category[0], item.budget, vm.exchangeRate);
          item.spent = calculateSpentBudget(category[0], vm.exchangeRate);
          vm.budgets.push(item);
        });
      });
    }

    function calculateLeftBudget(category, budget, exchangeRate) {
      var expenses = $filter('filter')(vm.allExpenses, {category: {id: category.id}});
      var sum = 0;
      expenses.forEach(function(expense) {
        if(expense.currency == "USD") {
          sum += expense.price * exchangeRate;
        } else sum += expense.price;
      });
      return budget - sum;
    }

    function calculateSpentBudget(category, exchangeRate) {
      var expenses = $filter('filter')(vm.allExpenses, {category: {id: category.id}});
      var sum = 0;
      expenses.forEach(function(expense) {
        if(expense.currency == "USD") {
          sum += expense.price * exchangeRate;
        } else sum += expense.price;
      });
      return sum;
    }

    vm.changeCurrency = changeCurrency;
    vm.currencyLeftModel = "UAH";
    vm.currencySpentModel = "UAH";

    function changeCurrency(moneyType) {
      for(var budget in vm.budgets) {
        if(moneyType == "left") {
          if(vm.currencyLeftModel == "USD") {
            vm.budgets[budget].left /= vm.exchangeRate;
          } else vm.budgets[budget].left *= vm.exchangeRate;
        } else {
          if(vm.currencySpentModel == "USD") {
            vm.budgets[budget].spent /= vm.exchangeRate;
          } else vm.budgets[budget].spent *= vm.exchangeRate;
        }
      }
    }

    function updateBudgets(catId) {
      var category = $filter('filter')(vm.categories, {id: catId});
      var budg = $filter('filter')(vm.currentUser.budgets, {categoryId: category[0].name});
      for(var item in vm.budgets) {
        if(vm.budgets[item].categoryId == category[0].name) {
          vm.budgets[item].left = calculateLeftBudget(category[0], budg[0].budget, vm.exchangeRate);
          vm.budgets[item].spent = calculateSpentBudget(category[0], vm.exchangeRate);
          break;
        }
      }
    }
  }
};
