/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
		_ = require('lodash');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
	find: getExpenses,
	findPersonalExpenses: findPersonalExpenses,
	create: createExpense,
	findDeleted: findDeleted,
	restoreDeleted: restoreDeleted
};

function getExpenses(req, res) {
	var year = req.param('year');
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');
	var filter = {deletedBy: {$exists: false}}
	if (year) {
		var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
		var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
		filter = {deletedBy: {$exists: false}, time: {$gte: start, $lte: end }};
	}
	var expenseFilter = req.user.role === 'ADMIN' || req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}});
	var queryParams = actionUtil.parseCriteria(req);
	expenseFilter = queryParams.name ? _.assign(expenseFilter, {name: {'contains': queryParams.name}}) : expenseFilter;
	expenseFilter = queryParams.categoryId ? _.assign(expenseFilter, {categoryId: queryParams.categoryId}) : expenseFilter;
	expenseFilter = queryParams.subcategoryId ? _.assign(expenseFilter, {subcategoryId: queryParams.subcategoryId}) : expenseFilter;
	expenseFilter = queryParams.creatorId ? _.assign(expenseFilter, {creatorId: queryParams.creatorId}) : expenseFilter;
	if (queryParams.start) {
		var startTime = queryParams.start.getTime() / 1000;
		if (queryParams.end) {
			expenseFilter = _.assign(expenseFilter, {time: {$gte: startTime, $lte: queryParams.end.getTime() / 1000 }});
		}
		else {
			expenseFilter = _.assign(expenseFilter, {time: {$gte: startTime, $lte: (startTime + 86400) }});
		}
	}
	else if (queryParams.end) {
		var startTime = queryParams.end.getTime() / 1000;
		expenseFilter = _.assign(expenseFilter, {time: {$gte: startTime, $lte: (startTime + 86400) }});
	}
	var limit = actionUtil.parseLimit(req);
	var sort = actionUtil.parseSort(req);
	var priceSorting = sort && sort.indexOf('price') > -1;
	if (priceSorting) {
		limit = 10000;
	}
	Expense.find()
	.where(expenseFilter)
	.limit(limit)
	.sort(sort)
	.then(function(expenses) {
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var exchangeRates = Currency.find().then(function(exchangeRates) {
			return exchangeRates;
		});
		return [expenses, categories, exchangeRates];
	}).spread(function(expenses, categories, exchangeRates) {
		var compareDays = function(time1, time2) {
			var date1 = new Date(time1 * 1000);
			var date2 = new Date(time2 * 1000);
			return (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate());
		};
		var getExchangeRate = function(time) {
			var rate = _.find(exchangeRates, function(exchangeRate) {
				return compareDays(time, exchangeRate.time);
			});
			return rate ? rate.rate : exchangeRates[0].rate;
		}
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
			if (expense.currency === "UAH") {
				expense.altPrice = expense.price / getExchangeRate(expense.time);
			}
			else expense.altPrice = expense.price * getExchangeRate(expense.time);
			delete expense.categoryId;
			delete expense.subcategoryId;
		});
		if (priceSorting) {
			expenses.sort(function(a, b) {
				var aVal = a.currency === "UAH" ? a.price : a.altPrice;
				var bVal = b.currency === "UAH" ? b.price : b.altPrice;
				return (sort.indexOf('asc') > -1) ? aVal - bVal : bVal - aVal;
			});
			var expenses = expenses.slice(0, actionUtil.parseLimit(req));
		}
		return res.send(expenses);
	}).fail(function(err) {
		return res.send(err);
	});
}

function findPersonalExpenses(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');
	var filter = {deletedBy: {$exists: false}, personal: true};
	var expenseFilter = req.user.role === 'ADMIN' || req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}});

	Expense.find(expenseFilter)
		.sort(actionUtil.parseSort(req))
		.then(function(expenses) {
			var categories = Category.find().then(function(categories) {
				return categories;
			});
			return [expenses, categories];
		}).spread(function(expenses, categories) {
			var personalExpenses = _.filter(expenses, function(expense) {
				return (expense.creatorId == req.user.global_id);
			});
			personalExpenses.forEach(function(expense) {
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
			});
			return res.send(personalExpenses);
		}).fail(function(err) {
			return res.send(err);
		});
}

function createExpense(req, res) {
	var data = actionUtil.parseValues(req);
	data.creatorId = req.user.global_id || "unknown id";
	Expense.create(data).exec(function created (err, newInstance) {
		if (err) return res.negotiate(err);
		var log = {who: req.user.id, action: 'created', type: 'expense', target: newInstance.id, time: Number((new Date().getTime() / 1000).toFixed())};
		History.create(log).exec(function(err, log) {
			if (err) return res.negotiate(err);

			res.created(newInstance);
		});
	});
}

function findDeleted(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level == 2;
	}), 'id');
	var filter = {deletedBy: {$exists: true}};
	var expenseFilter = req.user.role === 'ADMIN' || req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}, 'creatorId': req.user.global_id});

	Expense.find(expenseFilter)
		.where(actionUtil.parseCriteria(req))
		.sort(actionUtil.parseSort(req))
		.then(function(expenses) {
			var categories = Category.find().then(function(categories) {
				return categories;
			});
			return [expenses, categories];
		}).spread(function(expenses, categories) {
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
			});
			return res.send(expenses);
		}).fail(function(err) {
			return res.send(err);
		});
}

function restoreDeleted(req, res) {
	var pk = actionUtil.requirePk(req);

	Expense.native(function(err, collection) {
		if(err) return res.serverError(err);

		collection.update({
				_id: { $in: [pk, new ObjectId(pk)] }
			},
			{
				$unset: {deletedBy: true}
			},
			function (err, results) {
				if (err) return res.serverError(err);
				return res.ok(results);
			});
	});
}
