module.exports = function(app) {
  app.controller('CategoriesController', CategoriesController);

  CategoriesController.$inject = ['CategoriesService'];

  function CategoriesController(CategoriesService) {

  }
};
