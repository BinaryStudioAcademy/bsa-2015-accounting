module.exports = function(app) {
  app.controller('CurrencyController', CurrencyController);

  CurrencyController.$inject = ['CurrencyService'];

  function CurrencyController(CurrencyService) {
    var vm = this;
    vm.exchangeRate = CurrencyService.getExchangeRateCash();
  }
};
