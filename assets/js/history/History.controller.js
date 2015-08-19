module.exports = function(app) {
	app.controller('HistoryController', HistoryController);

	HistoryController.$inject = ['HistoryService'];

	function HistoryController(HistoryService) {
		var vm = this;

		vm.type = 'Expense';
		vm.types = ['Expense', 'Budget', 'User'];
		vm.events = [];
		vm.getEvents = getEvents;
		
		vm.getEvents(vm.type);

		function getEvents(type) {
			HistoryService.getEvents(type).then(function(events) {
				vm.events = events;
			});
		}
	}
};