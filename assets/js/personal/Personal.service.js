module.exports = function(app) {
  app.factory('PersonalService', PersonalService);

  PersonalService.$inject = ["$resource"];

  function PersonalService($resource) {
    return {
      getPersonalExpenses: getPersonalExpenses
    };

    function getPersonalExpenses(creatorId) {
      return $resource("/expense", { sort: "time desc", where: {personal: true, creatorId: creatorId} }).query().$promise;
    }
  }
};
