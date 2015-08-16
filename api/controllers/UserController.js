/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	find: getUsers,
	getCurrentUser: getCurrentUser
};

function getCurrentUser(req, res) {
	if(!req.isAuthenticated()) return res.forbidden();
	return res.json(req.user);
}

function getUsers(req, res) {
	User.find({deletedBy: {$exists: false}})
	.then(function(users) {
		var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(categories) {
			return categories;
		});
		var currencies = Currency.find().then(function(currencies) {
			return currencies;
		});
		return [users, expenses, currencies];
	}).spread(function(users, expenses, currencies) {
		users.forEach(function(user) {
			user.budgets.forEach(function(budget) {
				var personalExpenses = _.filter(expenses, function(expense) {
					return (expense.creatorId == user.id && expense.categoryId == budget.id);
				});
				budget.used = 0;
				personalExpenses.forEach(function(expense) {
					if (expense.currency !== "UAH") {
						var expDate = new Date(expense.time * 1000);
						var rate = _.find(currencies, function(currency) {
							var currDate = new Date(currency.time * 1000);
							return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
						}).rate;
						budget.used += (expense.price * rate);
					}
					else {
						budget.used += expense.price;
					}
				});
			});
		});
		return res.send(users);
	}).fail(function(err) {
		return res.send(err);
	}) 
}