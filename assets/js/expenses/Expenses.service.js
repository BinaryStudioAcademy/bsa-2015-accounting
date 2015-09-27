module.exports = function(app) {
	app.factory('ExpensesService', ExpensesService);

	ExpensesService.$inject = ["$resource", "$q"];

	function ExpensesService($resource, $q) {
		return {
			getExpenses: getExpenses,
			getAllExpenses: getAllExpenses,
			createExpense: createExpense,
			editExpense: editExpense,
			deleteExpense: deleteExpense,
			getCategories: getCategories,
			getDeletedExpenses: getDeletedExpenses,
			restoreExpense: restoreExpense
		};

		function getRequest() {
			return $resource("expense/:id", { id: "@id" });
		}

		/**
		 * Gets expenses array
		 * @returns promise object
		 */
		function getExpenses() {
			var usersPromise = $resource("../profile/api/users/").query().$promise;
			var expensesPromise = $resource("expense/:id", { id: "@id", sort: "time desc" }).query().$promise;

			return $q.all([usersPromise, expensesPromise]).then(function(data) {
				var users = data[0] || [];
				var expenses = data[1] || [];

				expenses.forEach(function(expense) {
					var user = _.find(users, {serverUserId: expense.creatorId}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					expense.creator = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
					delete expense.creatorId;
				});
				return expenses;
			});
		}

		function getAllExpenses(year) {
			var usersPromise = $resource("../profile/api/users/").query().$promise;
			var expensesPromise = $resource("expenses_by_year/" + year).query().$promise;

			return $q.all([usersPromise, expensesPromise]).then(function(data) {
				var users = data[0] || [];
				var expenses = data[1] || [];

				expenses.forEach(function(expense) {
					var user = _.find(users, {serverUserId: expense.creatorId}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					expense.creator = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
					delete expense.creatorId;
				});
				return expenses;
			});
		}

		function getDeletedExpenses() {
			var usersPromise = $resource("../profile/api/users/").query().$promise;
			var expensesPromise = $resource("deleted/expenses", { sort: "time desc" }).query().$promise;

			return $q.all([usersPromise, expensesPromise]).then(function(data) {
				var users = data[0] || [];
				var expenses = data[1] || [];

				expenses.forEach(function(expense) {
					var user = _.find(users, {serverUserId: expense.creatorId}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					expense.creator = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
					delete expense.creatorId;
					user = _.find(users, {serverUserId: expense.deletedBy}) || {serverUserId: "unknown id", name: "someone", surname: "unknown"};
					expense.deletedBy = {
						global_id: user.serverUserId,
						name: user.name + " " + user.surname
					};
				});
				return expenses;
			});
		}

		function restoreExpense(expenseId) {
			var data = $resource("expense/restore/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: expenseId }).$promise;
		}

		/**
		 * Creates new expense
		 * @param newExpense New expense object
		 * @returns promise object
		 */
		function createExpense(newExpense) {
			return getRequest().save(newExpense).$promise;
		}

		/**
		 * Updates expense by id
		 * @param expenseId Expense id
		 * @param newExpense New expense object
		 * @returns promise object
		 */
		function editExpense(expenseId, newExpense) {
			var data = $resource("expense/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: expenseId }, newExpense).$promise;
		}

		/**
		 * Removes expense by id
		 * @param expenseId Expense id
		 * @returns promise object
		 */
		function deleteExpense(expenseId) {
			return getRequest().remove({ id: expenseId }).$promise;
		}

		function getCategories() {
			return $resource("category/:id", { id: "@id" }).query().$promise;
		}
	}
};
