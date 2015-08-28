module.exports = function(app) {
	app.controller('HistoryController', HistoryController);

	HistoryController.$inject = ['HistoryService'];

	function HistoryController(HistoryService) {
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
			HistoryService.getEvents(type).then(function(events) {
				vm.events = events;
			});
		}

		function order (predicate) {
			vm.reverse = (vm.predicate === predicate) ? !vm.reverse : false;
			vm.predicate = predicate;
		};
	}
};