module.exports = function(app) {
  app.factory('ChartsService', ChartsService);

  ChartsService.$inject = ["$resource"];

  function ChartsService($resource) {
    return {

    };

    function getRequest() {
      return $resource("/charts/:id", { id: "@id" });
    }
  }
};
