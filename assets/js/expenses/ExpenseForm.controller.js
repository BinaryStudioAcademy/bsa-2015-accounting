module.exports = function(app) {
  app.controller('ExpenseFormController', ExpenseFormController);

  ExpenseFormController.$inject = ['ExpensesService'];

  function ExpenseFormController(ExpensesService) {
    var vm = this;

    // Create new expense
    vm.expense = {};
    vm.date = new Date();
    vm.createExpense = createExpense;

    function createExpense() {
      // Convert time to timestamp
      vm.expense.time = Math.round(new Date(vm.date).getTime() / 1000);

      // Post
      ExpensesService.createExpense(vm.expense).then(function() {
        vm.expense = {};
      });
    }

    // Categories, subcategories for the post form
    vm.categories = [];
    vm.selectedCategory = "";
    vm.selectedSubcategory = "";
    vm.subcategories = [];
    vm.getSubcategories = getSubcategories;
    vm.setSubcategoryId = setSubcategoryId;

    getCategories();

    function getCategories() {
      ExpensesService.getCategories().then(function(data) {
        data.forEach(function(category) {
          vm.categories.push(category);
        });
        // Load subcategories
        if(!vm.categories.isEmpty) {
          getSubcategories(vm.categories[0].name);
          vm.selectedCategory = vm.categories[0].name;
        }
        if(!vm.subcategories.isEmpty) {
          vm.selectedSubcategory = vm.subcategories[0];
          setSubcategoryId();
        }
      });
    }

    function getSubcategories(categoryName) {
      if(typeof categoryName === "undefined") categoryName = vm.selectedCategory;
      for(var category in vm.categories) {
        if(vm.categories[category].name == categoryName) {
          vm.subcategories = [];
          vm.categories[category].subcategories.forEach(function(subcategory) {
            vm.subcategories.push(subcategory.name);
          });

          // Set first subcategory name and id
          if(!vm.subcategories.isEmpty) {
            // To combo box
            vm.selectedSubcategory = vm.subcategories[0];
            setSubcategoryId(); // To post object
          }
          // Set category id to the new post object
          vm.expense.categoryId = vm.categories[category].id;
          break;
        }
      }
    }

    function setSubcategoryId() {
      for(var category in vm.categories) {
        if(vm.categories[category].name == vm.selectedCategory) {
          for(var subcategory in vm.categories[category].subcategories) {
            if(vm.categories[category].subcategories[subcategory].name == vm.selectedSubcategory) {
              vm.expense.subcategoryId = vm.categories[category].subcategories[subcategory].id;
              break;
            }
          }
          break;
        }
      }
    }
  }
};

