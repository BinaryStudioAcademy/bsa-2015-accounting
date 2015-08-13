module.exports = function(app) {
  app.factory('BudgetsService', BudgetsService);

  BudgetsService.$inject = ["$resource"];

  function BudgetsService($resource) {
    return {
      getBudgets: getBudgets,
      createBudget: createBudget,
      editBudget: editBudget,
      deleteBudget: deleteBudget
    };

    function getRequest() {
      return $resource("/budget/:id", { id: "@id"});
    }

    /**
     * Gets budgets array
     * @returns budgets array
     */
    function getBudgets(year) {
      return $resource("/budget", { where: {"year": year}}).query().$promise;
    }

    /**
     * Creates new budget
     * @param newBudget New budget object
     * @returns created object
     */
    function createBudget(newBudget) {
      return getRequest().save(newBudget).$promise;
    }

    /**
     * Updates budget by id
     * @param budgetId Budget id
     * @param newBudget New budget object
     * @returns edited object
     */
    function editBudget(budgetId, newBudget) {
      var data = $resource("/budget/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: budgetId }, newBudget).$promise;
    }

    /**
     * Removes budget by id
     * @param budgetId Budget id
     * @returns deleted object
     */
    function deleteBudget(budgetId) {
      return getRequest().remove({ id: budgetId }).$promise;
    }
  }
};
