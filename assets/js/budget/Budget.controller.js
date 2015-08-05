module.exports = function(app) {
  app.controller('BudgetController', BudgetController);

  BudgetController.$inject = ['BudgetService'];

  function BudgetController(BudgetService) {

  }
};
