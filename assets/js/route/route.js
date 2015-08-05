module.exports = function(app) {
  app.config(RouteConfig);

  RouteConfig.$inject = ['$routeProvider'];

  function RouteConfig($routeProvider) {
    $routeProvider.
      when('/expenses', {
        templateUrl: 'assets/js/expenses/Expenses.html',
        controller: 'ExpensesController'
      }).
      when('/planning', {
        templateUrl: 'assets/js/categories/Budgets.html',
        controller: 'CategoriesController'
      }).
      otherwise({
        redirectTo: '/expenses'
      });
  }
};
