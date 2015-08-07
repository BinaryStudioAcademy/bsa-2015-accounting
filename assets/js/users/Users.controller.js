module.exports = function(app) {
  app.controller('UsersController', UsersController);

  UsersController.$inject = ['UsersService'];

  function UsersController(UsersService) {
    var vm = this;
    vm.currentUser = UsersService.getCurrentUser();
  }
};
