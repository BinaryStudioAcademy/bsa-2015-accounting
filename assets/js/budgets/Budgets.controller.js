module.exports = function(app) {
  app.controller('BudgetsController', BudgetsController);

  BudgetsController.$inject = ['BudgetsService'];

  function BudgetsController(BudgetsService) {

  }
};
