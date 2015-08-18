module.exports = function(app) {
  app.factory('CurrencyService', CurrencyService);

  CurrencyService.$inject = ["$resource"];

  function CurrencyService($resource) {
    return {
      getExchangeRate: getExchangeRate,
      getExchangeRates: getExchangeRates
    };

    function getExchangeRate() {
      return $resource("/currency").query({limit: 1}).$promise;
    }

    function getExchangeRates(year) {
      return $resource("/currency", { where: {"year": year}}).query().$promise;
    }
  }
};
