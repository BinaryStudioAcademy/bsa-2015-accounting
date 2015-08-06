module.exports = function(app) {
  app.controller('ExpensesController', ExpensesController);

  ExpensesController.$inject = ['ExpensesService'];

  function ExpensesController(ExpensesService) {

  }
};
