module.exports = function(app) {
  app.factory('ChartsService', ChartsService);

  ChartsService.$inject = ["$resource"];

  function ChartsService($resource) {
    return {
      getBudgets: getBudgets,
      getBudgetsByYear: getBudgetsByYear,
      getCategory: getCategory
    };

    function getBudgets() {
      return $resource("/budget/:id", { id: "@id" }).query().$promise;
    }

    function getBudgetsByYear(year) {
      return $resource("/budget/:id", { id: "@id", where: {"year": year} }).query().$promise;
    }

    function getCategory(categoryId) {
      return $resource("/category/:id", { id: "@id" }).get({ id: categoryId }).$promise;
    }
  }
};
