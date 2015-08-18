module.exports = function(app) {
  app.controller('HomepageController', HomepageController);

  HomepageController.$inject = ['$rootScope', 'UsersService', 'CurrencyService', '$route', '$filter'];

  function HomepageController($rootScope, UsersService, CurrencyService, $route, $filter) {
    $rootScope.currentUser = {};
    $rootScope.$route = $route;
    UsersService.getCurrentUser().then(function(user) {
      $rootScope.currentUser = user;
    });

    $rootScope.exchangeRate = 0;
    CurrencyService.getExchangeRate().then(function(rate) {
      $rootScope.exchangeRate = rate[0].rate;
    });

    $rootScope.getPermission = function(categoryId) {
      var permission = $filter('filter')($rootScope.currentUser.permissions, {id: categoryId});
      if(permission[0]) return permission[0].level;
      else return 0;
    }
  }
};
