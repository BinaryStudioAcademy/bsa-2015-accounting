/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');

module.exports = {
	find: getExpenses
};

function getExpenses(req, res) {
	var year = req.param('year');
	var filter = {deletedBy: {$exists: false}};
	if (year) {
		var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
		var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
		filter = {deletedBy: {$exists: false}, time: {$gte: start, $lte: end }}
	}

	Expense.find(filter)
	.then(function(expenses) {
		var users = User.find().then(function(users) {
			return users;
		});
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		return [expenses, users, categories];
	}).spread(function(expenses, users, categories) {
		expenses.forEach(function(expense) {
			var category = _.find(categories, {id: expense.categoryId});
			expense.category = {
				id: expense.categoryId,
				name: category.name
			};
			expense.subcategory = {
				id: expense.subcategoryId,
				name: _.find(category.subcategories, {id: expense.subcategoryId}).name
			};
			delete expense.categoryId;
			delete expense.subcategoryId;
			expense.creator = {
				id: expense.creatorId,
				name: _.find(users, {id: expense.creatorId}).name
			};
			delete expense.creatorId;
		});
		return res.send(expenses);
	}).fail(function(err) {
		return res.send(err);
	}) 
}