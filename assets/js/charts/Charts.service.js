module.exports = function(app) {
  app.factory('ChartsService', ChartsService);

  ChartsService.$inject = ["$resource"];

  function ChartsService($resource) {
    return {
      //getBudgets: getBudgets,
      getBudgetsByYear: getBudgetsByYear,
      getCategories: getCategories
    };

    // function getBudgets() {
    //   return $resource("/budget", { where: {"year": year}}).query().$promise;
    // }

/*    function getBudgetsByYear(year) {
      return $resource("/budget/:id", { id: "@id", where: {"year": year} }).query().$promise;
    }*/
    function getBudgetsByYear(year) {
      return $resource("/budget", { where: {"year": year}}).query().$promise;
    }
    function getCategories() {
      return $resource("/category/:id", { id: "@id" }).query().$promise;
    }
  }
};
