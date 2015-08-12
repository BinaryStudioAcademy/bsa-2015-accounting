/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');

module.exports = {
	find: getExpenses,
	byYear: expensesByYear
};

function expensesByYear(req, res) {
	var year = req.param('year');
	var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
	var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;

	Expense.find({deletedBy: {$exists: false}, time: {$gte: start, $lte: end }}).populateAll().exec(function(err, expenses) {
		return res.send(expenses);
	});
}

function getExpenses(req, res) {
	Expense.find({deletedBy: {$exists: false}})
    .sort(actionUtil.parseSort(req))
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
