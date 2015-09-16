module.exports = function(app) {
	app.controller('HomepageController', HomepageController);

	HomepageController.$inject = ['$rootScope', 'UsersService', 'CurrencyService', '$route', '$filter'];

	function HomepageController($rootScope, UsersService, CurrencyService, $route, $filter) {
		
		//menu
		$rootScope.menuTabs = true;
		$rootScope.toggleMenu = function(){
			$rootScope.menuTabs = $rootScope.menuTabs === false ? true : false;
		}

		$rootScope.currentUser = {};
		$rootScope.$route = $route;
		UsersService.getCurrentUser().then(function(user) {
			$rootScope.currentUser = user;
		});

		$rootScope.exchangeRate = 0;
		CurrencyService.getExchangeRate().then(function(rate) {
			$rootScope.exchangeRate = rate[0].rate;
		});

		$rootScope.getPermission = function(categoryId) {
			var permission = $filter('filter')($rootScope.currentUser.categories, {id: categoryId});
			if(permission[0]) return permission[0].level;
			else return 0;
		}
	}
};
