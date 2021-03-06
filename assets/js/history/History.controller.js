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

			HistoryService.getEvents(type).then(function(data) {
				vm.events = data;
			});
		}

		function order(predicate) {
			vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
			vm.predicate = predicate;
		};
	}
};