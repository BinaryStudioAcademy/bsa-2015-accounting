module.exports = function(app) {
  app.factory('HistoryService', HistoryService);

  HistoryService.$inject = ["$resource"];

  function HistoryService($resource) {
    return {
      getEvents: getEvents,
    };
   function getRequest(type) {
      return $resource("/history", {"type": type.toLowerCase()});
    }

    function getEvents(type) {
      return getRequest(type).query().$promise;
    }
  }
};
