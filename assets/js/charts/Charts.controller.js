module.exports = function(app) {
  app.controller('ChartsController', ChartsController);

  ChartsController.$inject = ['ChartsService'];

  function ChartsController(ChartsService) {

  }
};
