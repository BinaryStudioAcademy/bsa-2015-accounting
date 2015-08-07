module.exports = function(app) {
  app.factory('CurrencyService', CurrencyService);

  CurrencyService.$inject = ["$resource"];

  function CurrencyService($resource) {
    return {
      getExchangeRateCash: getExchangeRateCash,
      getExchangeRateCashless: getExchangeRateCashless
    };

    function getExchangeRateCash() {
      var Rate = $resource("/currency");

      var date = new Date();

      var yyyy = date.getFullYear().toString();
      var mm = (date.getMonth()+1).toString();
      var dd  = date.getDate().toString();

      var fullDate = dd + ":" + mm + ":" + yyyy;

      Rate.get({time: fullDate});
    }

    function getExchangeRateCashless() {
      var Rate = $resource("http://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11");
      return Rate.get({ ccy: "USD" });
    }
  }
};
