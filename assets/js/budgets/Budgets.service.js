module.exports = function(app) {
  app.factory('BudgetsService', BudgetsService);

  BudgetsService.$inject = ["$resource"];

  function BudgetsService($resource) {
    return {
      getBudgets: getBudgets,
      getBudget: getBudget,
      createBudget: createBudget,
      editBudget: editBudget,
      deleteBudget: deleteBudget,
      restoreBudget: restoreBudget,
      getDeletedBudgets: getDeletedBudgets
    };

    function getRequest() {
      return $resource("budget/:id", { id: "@id"});
    }

    function getBudget(budgetId) {
      return getRequest().get({ id: budgetId }).$promise;
    }

    /**
     * Gets budgets array
     * @returns budgets array
     */
    function getBudgets(year) {
      return $resource("budget", { where: {"year": year}}).query().$promise;
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
      var data = $resource("budget/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: budgetId }, newBudget).$promise;
    }

    function restoreBudget(budgetId) {
      var data = $resource("budget/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: budgetId }, {$unset: {deletedBy: "" }}).$promise;
    }

    /**
     * Removes budget by id
     * @param budgetId Budget id
     * @returns deleted object
     */
    function deleteBudget(budgetId) {
      return getRequest().remove({ id: budgetId }).$promise;
    }

    function getDeletedBudgets(year) {
      return $resource("deleted/budgets", { where: {"year": year}}).get().$promise;
    }
  }
};
