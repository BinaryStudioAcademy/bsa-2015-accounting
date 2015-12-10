module.exports = function(app) {
  app.factory('PersonalService', PersonalService);

  PersonalService.$inject = ["$resource"];

  function PersonalService($resource) {
    return {
      getPersonalExpenses: getPersonalExpenses,
      getPersonalHistory: getPersonalHistory
    };

    /*function getPersonalExpenses() {
      return $resource("expense/personal", { sort: "time desc" }).query().$promise;
    }*/

    function getPersonalExpenses(expensesQuery) {
      if (!expensesQuery) {
        expensesQuery = { sort: "time desc" };
      }
      return $resource("expense/personal", expensesQuery).query().$promise;
    }

    function getPersonalHistory() {
      return $resource("personal/:id", { id: "@id", sort: "time desc" }).query().$promise;
    }
  }
};
