module.exports = function(app) {
  app.factory('PersonalService', PersonalService);

  PersonalService.$inject = ["$resource"];

  function PersonalService($resource) {
    return {
      getPersonalExpenses: getPersonalExpenses,
      getPersonalHistory: getPersonalHistory
    };

    function getPersonalExpenses() {
      return $resource("/expense?personal=true", { sort: "time desc", where: {personal: true}}).query().$promise;
    }

    function getPersonalHistory() {
      return $resource("/personal/:id", { id: "@id", sort: "time desc" }).query().$promise;
    }
  }
};
