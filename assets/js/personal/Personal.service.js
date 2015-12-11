module.exports = function(app) {
  app.factory('PersonalService', PersonalService);

  PersonalService.$inject = ["$resource", "$q"];

  function PersonalService($resource, $q) {
    return {
      getPersonalExpenses: getPersonalExpenses,
      getPersonalHistory: getPersonalHistory
    };

    /*function getPersonalExpenses() {
      return $resource("expense/personal", { sort: "time desc" }).query().$promise;
    }*/

    function getPersonalExpenses(expensesQuery) {
      if (!expensesQuery) {
        expensesQuery = { sort: "time desc" };
      }
      return $resource("expense/personal", expensesQuery).query().$promise;
    }

    function getPersonalHistory() {
      var usersPromise = $resource('../profile/api/users').query().$promise;
      var eventsPromise = $resource("personal/:id", { id: "@id", sort: "time desc" }).query().$promise;

      return $q.all([usersPromise, eventsPromise]).then(function(data) {
        var users = data[0] || [];
        var events = data[1] || [];

        events.forEach(function(event) {
          var user = _.find(users, {serverUserId: event.who}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
          event.who = user.name + " " + user.surname;
          var user = _.find(users, {serverUserId: event.target}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
          event.target = user.name + " " + user.surname;
        });
        return events;
      });
    }
  }
};
