module.exports = function(app) {
	app.factory('BudgetsService', BudgetsService);

	BudgetsService.$inject = ["$resource", "$q"];

	function BudgetsService($resource, $q) {
		return {
			getBudgets: getBudgets,
			getBudget: getBudget,
			createBudget: createBudget,
			editBudget: editBudget,
			deleteBudget: deleteBudget,
			restoreBudget: restoreBudget,
			getDeletedBudgets: getDeletedBudgets
		};

		function getRequest() {
			return $resource("budget/:id", { id: "@id"});
		}

		function getBudget(budgetId) {
			return getRequest().get({ id: budgetId }).$promise;
		}

		/**
		 * Gets budgets array
		 * @returns budgets array
		 */
		function getBudgets(year) {
			var usersPromise = $resource('../profile/api/users').query().$promise;
			var budgetsPromise = $resource("budget", { where: {"year": year}}).query().$promise;

			return $q.all([usersPromise, budgetsPromise]).then(function(data) {
				var users = data[0] || [];
				var budgets = data[1] || [];

				budgets.forEach(function(budget) {
					var user = _.find(users, {serverUserId: budget.creatorId}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					budget.creator = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
					delete budget.creatorId;
				});
				return budgets;
			});
		}

		/**
		 * Creates new budget
		 * @param newBudget New budget object
		 * @returns created object
		 */
		function createBudget(newBudget) {
			return getRequest().save(newBudget).$promise;
		}

		/**
		 * Updates budget by id
		 * @param budgetId Budget id
		 * @param newBudget New budget object
		 * @returns edited object
		 */
		function editBudget(budgetId, newBudget) {
			var data = $resource("budget/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: budgetId }, newBudget).$promise;
		}

		function restoreBudget(budgetId) {
			var data = $resource("budget/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: budgetId }, {$unset: {deletedBy: "" }}).$promise;
		}

		/**
		 * Removes budget by id
		 * @param budgetId Budget id
		 * @returns deleted object
		 */
		function deleteBudget(budgetId) {
			return getRequest().remove({ id: budgetId }).$promise;
		}

		function getDeletedBudgets(year) {
			var usersPromise = $resource('../profile/api/users').query().$promise;
			var budgetsPromise = $resource("deleted/budgets", { where: {"year": year}}).get().$promise;

			return $q.all([usersPromise, budgetsPromise]).then(function(data) {
				var users = data[0] || [];
				var deletedStuff = data[1] || [];

				deletedStuff.budgets.forEach(function(budget) {
					var user = _.find(users, {serverUserId: budget.creatorId}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					budget.creator = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
					delete budget.creatorId;
					user = _.find(users, {serverUserId: budget.deletedBy}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					budget.deletedBy = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
				});

				deletedStuff.subcategories.forEach(function(subcategory) {
					var user = _.find(users, {serverUserId: subcategory.deletedBy}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					subcategory.deletedBy = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
				});

				return deletedStuff;
			});
		}
	}
};
