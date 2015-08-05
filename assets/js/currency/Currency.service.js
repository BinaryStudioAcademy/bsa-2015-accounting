module.exports = function(app) {
  app.factory('CurrencyService', CurrencyService);

  CurrencyService.$inject = ["$resource"];

  function CurrencyService($resource) {
    return {
      getExchangeRateCash: getExchangeRateCash,
      getExchangeRateCashless: getExchangeRateCashless
    };

    function getExchangeRateCash() {
      var Rate = $resource("http://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5");
      return Rate.get({ ccy: "USD" });
    }

    function getExchangeRateCashless() {
      var Rate = $resource("http://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11");
      return Rate.get({ ccy: "USD" });
    }
  }
};
