module.exports = function(app) {
  app.factory('ExpensesService', ExpensesService);

  ExpensesService.$inject = ["$resource"];

  function ExpensesService($resource) {
    return {
      getExpenses: getExpenses,
      getAllExpenses: getAllExpenses,
      createExpense: createExpense,
      editExpense: editExpense,
      deleteExpense: deleteExpense,
      getCategories: getCategories
    };

    function getRequest() {
      return $resource("/expense/:id", { id: "@id" });
    }

    /**
     * Gets expenses array
     * @returns promise object
     */
    function getExpenses() {
      return $resource("/expense/:id", { id: "@id", sort: "time desc" }).query().$promise;
    }

    function getAllExpenses(year) {
      return $resource("/expenses_by_year/" + year).query().$promise;
    }

    /**
     * Creates new expense
     * @param newExpense New expense object
     * @returns promise object
     */
    function createExpense(newExpense) {
      return getRequest().save(newExpense).$promise;
    }

    /**
     * Updates expense by id
     * @param expenseId Expense id
     * @param newExpense New expense object
     * @returns promise object
     */
    function editExpense(expenseId, newExpense) {
      var data = $resource("/expense/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: expenseId }, newExpense).$promise;
    }

    /**
     * Removes expense by id
     * @param expenseId Expense id
     * @returns promise object
     */
    function deleteExpense(expenseId) {
      return getRequest().remove({ id: expenseId }).$promise;
    }

    function getCategories() {
      return $resource("/category/:id", { id: "@id" }).query().$promise;
    }
  }
};
