module.exports = function(app) {
  app.factory('HistoryService', HistoryService);

  HistoryService.$inject = ["$resource", "$q"];

  function HistoryService($resource, $q) {
    return {
      getEvents: getEvents,
    };
   function getRequest(type) {
      return $resource("history", {"type": type});
    }

    function getEvents(type) {
      var usersPromise = $resource('../profile/api/users').query().$promise;
      var eventsPromise = getRequest(type).query().$promise;

      return $q.all([usersPromise, eventsPromise]).then(function(data) {
        var users = data[0] || [];
        var events = data[1] || [];

        events.forEach(function(event) {
          var user = _.find(users, {serverUserId: event.who}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
          event.who = user.name + " " + user.surname;
          if (event.type === 'user') {
            var user = _.find(users, {serverUserId: event.target}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
            event.target = user.name + " " + user.surname;
          }
        });
        return events;
      });
    }
  }
};
