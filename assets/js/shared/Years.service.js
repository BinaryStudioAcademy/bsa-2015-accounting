module.exports = function(app) {
  app.factory('YearsService', YearsService);

  YearsService.$inject = ["$resource"];

  function YearsService($resource) {
    return {
      getYears: getYears
    };

    function getRequest() {
      return $resource("years");
    }

    /**
     * Gets categories array
     * @returns categories array
     */
    function getYears() {
      return getRequest().query().$promise;
    }
  }
};
