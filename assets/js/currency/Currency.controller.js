module.exports = function(app) {
  app.controller('CurrencyController', CurrencyController);

  CurrencyController.$inject = ['CurrencyService'];

  function CurrencyController(CurrencyService) {
    var vm = this;
    vm.exchangeRate = 0;

    getRate();

    function getRate() {
      CurrencyService.getExchangeRate().then(function(data) {
        vm.exchangeRate = data[0].rate;
      })
    }
  }
};
