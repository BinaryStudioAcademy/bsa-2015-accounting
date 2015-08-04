module.exports = function(app) {
  app.controller('CategoriesController', CategoriesController);

  function CategoriesController() {
    this.greeting = 'Angular works!!';
  }
};
