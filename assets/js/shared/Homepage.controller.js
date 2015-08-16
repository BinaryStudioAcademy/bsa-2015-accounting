module.exports = function(app) {
  app.controller('HomepageController', HomepageController);

  HomepageController.$inject = ['UsersService', 'CurrencyService'];

  function HomepageController(UsersService, CurrencyService) {
    var vm = this;
    vm.currentUser = {};
    UsersService.getCurrentUser().then(function(user) {
      vm.currentUser = user;
    });

    vm.exchangeRate = 0;
    CurrencyService.getExchangeRate().then(function(rate) {
      vm.exchangeRate = rate[0].rate;
    });
  }
};
