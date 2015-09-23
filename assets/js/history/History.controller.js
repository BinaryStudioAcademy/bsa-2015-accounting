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
			} else {
				type.toLowerCase()
			}
			$q.all([HistoryService.getEvents(type), UsersService.getGlobalUsers()]).then(function(data) {
				var events = data[0] || [];
				var globalUsers = data[1] || [];
				console.log('events', events);
				console.log('globalUsers', globalUsers);

				var eventsPlus = events.map(function(event) {
					var user = event.who ? _.find(globalUsers, {id: event.who}) : false;
					event.who = user ? user.name + user.surname : 'NO NAME';
					return event;
				});
				console.log('eventsPlus', eventsPlus);
				vm.events = eventsPlus;
			});
		}

		function order (predicate) {
			vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
			vm.predicate = predicate;
		};
	}
};