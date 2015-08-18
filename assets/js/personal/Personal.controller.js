var swal = require('sweetalert');

module.exports = function(app) {
  app.controller('PersonalController', PersonalController);

  PersonalController.$inject = [
    'PersonalService',
    'CategoriesService',
    'ExpensesService',
    'UsersService',
    '$filter',
    '$rootScope',
    '$q'
  ];

  function PersonalController(PersonalService, CategoriesService, ExpensesService, UsersService, $filter, $rootScope, $q) {
    var vm = this;

    vm.currentUser = $rootScope.currentUser;
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
      var personalExpensesPromise = PersonalService.getPersonalExpenses(vm.currentUser.id);
      var categoriesPromise = CategoriesService.getCategories();

      $q.all([personalExpensesPromise, categoriesPromise]).then(function(data) {
        vm.allExpenses = data[0];
        vm.categories = data[1];

        if(vm.allExpenses.length != 0 && vm.categories.length != 0) {
          convertDates(vm.allExpenses);
          loadExpenses();
          getUsersBudgets();
        }
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
      ExpensesService.editExpense(id, expense);
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
      else if(typeof field == "number") {
        if(field < 1) return "Amount should be more than zero";
      }
    }

    // Filter combo boxes
    vm.categories = [];
    vm.subcategories = [];
    vm.getSubcategories = getSubcategories;

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
    vm.exchangeRate = $rootScope.exchangeRate;

    function getUsersBudgets() {
      vm.currentUser.budgets.forEach(function(item) {
        var category = $filter('filter')(vm.categories, {id: item.id});
        item.categoryId = category[0].name;
        item.spent = item.used;
        item.left = item.budget - item.used;
        vm.budgets.push(item);
      });
    }

    vm.changeCurrency = changeCurrency;
    vm.currencyLeftModel = "UAH";
    vm.currencySpentModel = "UAH";
    var currencyExchangeLeftFlag = true;
    var currencyExchangeSpentFlag = true;

    function changeCurrency(moneyType) {
      vm.budgets.forEach(function(item) {
        if(moneyType == "left") {
          if(vm.currencyLeftModel == "USD" && currencyExchangeLeftFlag) {
            item.left /= vm.exchangeRate;
            currencyExchangeLeftFlag = false;
          } else if(vm.currencyLeftModel == "UAH" && !currencyExchangeLeftFlag) {
            item.left *= vm.exchangeRate;
            currencyExchangeLeftFlag = true;
          }
        } else {
          if(vm.currencySpentModel == "USD" && currencyExchangeSpentFlag) {
            item.spent /= vm.exchangeRate;
            currencyExchangeSpentFlag = false;
          } else if(vm.currencySpentModel == "UAH" && !currencyExchangeSpentFlag) {
            item.spent *= vm.exchangeRate;
            currencyExchangeSpentFlag = true;
          }
        }
      });
    }

    // Money form
    vm.isShowTitle = false;

    vm.showTitle = showTitle;
    function showTitle(isShow) {
      vm.isShowTitle = isShow;
    }

    vm.newMoney = {
      money: 0
    };

    vm.addMoney = addMoney;
    function addMoney() {
      var category = $filter('filter')(vm.categories, {id: vm.newMoney.category});
      // Check permissions
      if($rootScope.getPermission(vm.newMoney.category.id) > 1 || $rootScope.currentUser.admin) {
        // Ok
        swal({
            title: "Are you sure?",
            text: "Are you sure want to add " + vm.newMoney.money + " "
            + vm.newMoney.currency + " to your personal " + category[0].name + " budget?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, add it!",
            closeOnConfirm: false
          },
          function() {
            var budg = $filter('filter')($rootScope.currentUser.budgets, {id: vm.newMoney.category});
            var newBudget = 0;
            if(vm.newMoney.currency == "USD") {
              newBudget = vm.newMoney.money / $rootScope.exchangeRate;
            } else newBudget = vm.newMoney.money;

            if(budg[0]) {
              budg[0].budget += newBudget;
              UsersService.editUser($rootScope.currentUser.id,
                {addPersonalBudget: {id: vm.newMoney.category, budget: newBudget}});
            } else {
              UsersService.editUser($rootScope.currentUser.id,
                {addPersonalBudget: {id: vm.newMoney.category, budget: newBudget}});
            }

            swal("Ok!", "You added " + vm.newMoney.money + " "
              + vm.newMoney.currency + " to your personal " + category[0].name + " budget", "success");
          });
      } else {
        // No permissions
        swal("Cancelled", "You have no permissions to add money to the " + category[0].name + " category", "error");
      }
    }

    vm.editNewMoneyObject = editNewMoneyObject;
    function editNewMoneyObject(data, field) {
      vm.newMoney[field] = data;
    }
  }
};
