module.exports = function(app) {
  app.config(RouteConfig);

  RouteConfig.$inject = ['$routeProvider'];

  function RouteConfig($routeProvider) {
    $routeProvider.
      when('/expenses', {
        templateUrl: '/templates/Expenses.html',
        controller: 'ExpensesController'
      }).
      when('/planning', {
        templateUrl: '/templates/Budgets.html',
        controller: 'BudgetsController',
        controllerAs: 'budCtrl'
      }).
      when('/charts', {
        templateUrl: '/templates/Charts.html',
        controller: 'ChartsController'
      }).
      otherwise({
        redirectTo: '/expenses'
      });
  }
};
