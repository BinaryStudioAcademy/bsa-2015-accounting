_ = require('lodash');

module.exports = function(app) {
	app.controller('HistoryController', HistoryController);

	HistoryController.$inject = ['HistoryService', 'UsersService', '$q'];

	function HistoryController(HistoryService, UsersService, $q) {
		var vm = this;

		vm.type = 'All';
		vm.types = ['All', 'Expense', 'Budget', 'User'];
		vm.events = [];
		vm.limit = 50;
		vm.predicate = 'time';
		vm.reverse = true;

		vm.getEvents = getEvents;
		vm.order = order;

		vm.getEvents(vm.type);

		function getEvents(type) {
			if (type === 'All') {
				type = '';
			}

			$q.all([HistoryService.getEvents(type), UsersService.getUsers()]).then(function(data) {
				var events = data[0] || [];
				var users = data[1] || [];
				console.log('events', events);
				console.log('globalUsers', users);

				var eventsPlus = events.map(function(event) {
					var user =  _.find(users, {id: event.who});
					event.who = user ? user.name + ' ' + user.surname : 'NO NAME';
					return event;
				});
				console.log('eventsPlus', eventsPlus);
				vm.events = eventsPlus;
			});
		}

		function order(predicate) {
			vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
			vm.predicate = predicate;
		};
	}
};