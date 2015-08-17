module.exports = function(app) {
  app.factory('ChartsService', ChartsService);

  ChartsService.$inject = ["$resource"];

  function ChartsService($resource) {
    return {
      //getBudgets: getBudgets,
      getBudgetsByYear: getBudgetsByYear,
      getCategories: getCategories
    };

    function getCategories() {
      return $resource("/category/:id", { id: "@id" }).query().$promise;
    }
  }
};
