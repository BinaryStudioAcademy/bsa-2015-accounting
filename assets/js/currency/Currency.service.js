module.exports = function(app) {
  app.factory('CurrencyService', CurrencyService);

  CurrencyService.$inject = ["$resource"];

  function CurrencyService($resource) {
    return {
      getExchangeRate: getExchangeRate
    };

    function getExchangeRate() {
      return $resource("/currency").query({sort: "time desc", limit: 1}).$promise;
    }
  }
};
