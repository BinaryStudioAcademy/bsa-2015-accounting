module.exports = function(app) {
	app.controller('HistoryController', HistoryController);

	HistoryController.$inject = ['HistoryService'];

	function HistoryController(HistoryService) {
		var vm = this;

		vm.type = 'Expense';
		vm.types = ['Expense', 'Budget', 'User'];
		vm.events = [];
		vm.limit = 30;
		vm.predicate = 'age';
		vm.reverse = true;

		vm.getEvents = getEvents;
		vm.order = order;



		vm.getEvents(vm.type);

		function getEvents(type) {
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