module.exports = function(app) {
  app.controller('HomepageController', HomepageController);

  HomepageController.$inject = ['$rootScope', 'UsersService', 'CurrencyService'];

  function HomepageController($rootScope, UsersService, CurrencyService) {
    $rootScope.currentUser = {};
    UsersService.getCurrentUser().then(function(user) {
      $rootScope.currentUser = user;
    });

    $rootScope.exchangeRate = 0;
    CurrencyService.getExchangeRate().then(function(rate) {
      $rootScope.exchangeRate = rate[0].rate;
    });
  }
};
