module.exports = function(app) {
  app.config(RouteConfig);

  RouteConfig.$inject = ['$routeProvider'];

  function RouteConfig($routeProvider) {
    $routeProvider.
      when('/expenses', {
        templateUrl: '/templates/Expenses.html',
        controller: 'ExpensesController',
        controllerAs:"expCtr"
      }).
      when('/planning', {
        templateUrl: '/templates/Budgets.html',
        controller: 'BudgetsController',
        controllerAs: 'budCtrl'
      }).
      when('/charts', {
        templateUrl: '/templates/Charts.html',
        controller: 'ChartsController',
        controllerAs:'chartCtrl'
      }).
      when('/users', {
        templateUrl: '/templates/Users.html',
        controller: 'UsersController',
        controllerAs:'userCtrl'
      }).
      otherwise({
        redirectTo: '/expenses'
      });
  }
};
