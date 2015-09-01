module.exports = function(app) {
  app.config(RouteConfig);

  RouteConfig.$inject = ['$routeProvider'];

  function RouteConfig($routeProvider) {
    $routeProvider.
      when('/expenses', {
        templateUrl: 'templates/Expenses.html',
        controller: 'ExpensesController',
        controllerAs:"expCtr",
        activetab: 'expenses'
      }).
      when('/planning', {
        templateUrl: 'templates/Budgets.html',
        controller: 'BudgetsController',
        controllerAs: 'budCtrl',
        activetab: 'planning'
      }).
      when('/charts', {
        templateUrl: 'templates/Charts.html',
        controller: 'ChartsController',
        controllerAs:'chartCtrl',
        activetab: 'charts'
      }).
      when('/personal', {
        templateUrl: 'templates/Personal.html',
        controller: 'PersonalController',
        controllerAs:'personalCtrl',
        activetab: 'personal'
      }).
      when('/administration', {
        templateUrl: 'templates/Administration.html',
        controller: 'AdministrationController',
        controllerAs:'admCtrl',
        activetab: 'administration'
      }).
      when('/history', {
        templateUrl: 'templates/History.html',
        controller: 'HistoryController',
        controllerAs: 'hstCtrl',
        activetab: 'history'
      }).
      when('/bin', {
        templateUrl: 'templates/Bin.html',
        controller: 'BinController',
        controllerAs:'binCtrl',
        activetab: 'bin'
      }).
      otherwise({
        redirectTo: '/expenses'
      });
  }
};
