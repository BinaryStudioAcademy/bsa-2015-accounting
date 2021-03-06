module.exports = function(app) {
	app.factory('CurrencyService', CurrencyService);

	CurrencyService.$inject = ["$resource"];

	function CurrencyService($resource) {
		return {
			getExchangeRate: getExchangeRate,
			getFirstRate: getFirstRate,
			getExchangeRates: getExchangeRates
		};

		function getExchangeRate() {
			return $resource("currency").query({sort: "time DESC", limit: 1}).$promise;
		}

		function getFirstRate() {
			return $resource("currency").query({sort: "time ASC", limit: 1}).$promise;
		}

		function getExchangeRates() {
			return $resource("currency").query().$promise;
		}
	}
};
