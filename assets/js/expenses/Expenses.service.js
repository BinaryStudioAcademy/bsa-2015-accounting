module.exports = function(app) {
  app.factory('ExpensesService', ExpensesService);

  ExpensesService.$inject = ["$resource"];

  function ExpensesService($resource) {
    return {
      getExpenses: getExpenses,
      createExpenses: createExpense,
      editExpenses: editExpense,
      deleteExpenses: deleteExpense
    };

    function getRequest() {
      return $resource("/expense/:id", { id: "@id" });
    }

    /**
     * Gets expenses array
     * @returns expenses array
     */
    function getExpenses(setIndex, setCount) {
      return $resource("/expense/:id", { id: "@id", skip: setIndex, limit: setCount }).query();
    }

    /**
     * Creates new expense
     * @param newExpense New expense object
     * @returns created object
     */
    function createExpense(newExpense) {
      return getRequest().save(newExpense);
    }

    /**
     * Updates expense by id
     * @param expenseId Expense id
     * @param newExpense New expense object
     * @returns edited object
     */
    function editExpense(expenseId, newExpense) {
      var data = $resource("/expense/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: expenseId }, newExpense);
    }

    /**
     * Removes expense by id
     * @param expenseId Expense id
     * @returns deleted object
     */
    function deleteExpense(expenseId) {
      return getRequest().remove({ id: expenseId });
    }
  }
};
