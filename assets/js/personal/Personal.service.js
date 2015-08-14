module.exports = function(app) {
  app.factory('PersonalService', PersonalService);

  PersonalService.$inject = ["$resource"];

  function PersonalService($resource) {
    return {
      getPersonalExpenses: getPersonalExpenses
    };

    function getPersonalExpenses() {
      return $resource("/expense", { sort: "time desc", where: {personal: true} }).query().$promise;
    }
  }
};
