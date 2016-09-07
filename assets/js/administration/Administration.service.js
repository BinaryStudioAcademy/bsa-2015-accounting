module.exports = function(app) {
	app.factory('AdministrationService', AdministrationService);

	AdministrationService.$inject = ["$resource", "$q"];

	function AdministrationService($resource, $q) {
		return {
			getClosingDate: getClosingDate,
			setClosingDate: setClosingDate
		};

		function getRequest() {
			return $resource("settings/closingDate");
		}

		/**
		 * Gets budgets array
		 * @returns budgets array
		 */
		function getClosingDate() {
			return $resource("settings/closingDate").get().$promise;
		}

		function setClosingDate(date) {
			var newData = {date : date};
			var data = $resource("settings/closingDate", null, {
				update: {
					method: "PUT"
				}
			});
			return data.update(newData).$promise;
		}
	}
};
