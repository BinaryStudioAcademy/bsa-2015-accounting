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

	if (queryParams.startDate || queryParams.endDate) {
		var startTime = queryParams.startDate ? Number((new Date(queryParams.startDate).getTime() / 1000).toFixed()) : Number((new Date(queryParams.endDate).getTime() / 1000).toFixed());
		var endTime = queryParams.endDate ? Number((new Date(queryParams.endDate).getTime() / 1000).toFixed()) : Number((new Date(queryParams.startDate).getTime() / 1000).toFixed());
		expenseFilter = _.assign(expenseFilter, {time: {$gte: startTime, $lt: (endTime + 86400) }});
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
				expense.altPrice = expense.price / _getExchangeRate(expense.time, exchangeRates);
			}
			else expense.altPrice = expense.price * _getExchangeRate(expense.time, exchangeRates);
			if(req.user.role === 'ADMIN' || req.user.admin) expense.editable = true;
			else expense.editable = _checkForEdit(expense.time);
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
	var filter = {deletedBy: {$exists: false}, personal: true, creatorId: req.user.global_id};
	var expenseFilter = req.user.role === 'ADMIN' || req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}});
	var queryParams = actionUtil.parseCriteria(req);

	if (queryParams.startDate || queryParams.endDate) {
		var startTime = queryParams.startDate ? Number((new Date(queryParams.startDate).getTime() / 1000).toFixed()) : Number((new Date(queryParams.endDate).getTime() / 1000).toFixed());
		var endTime = queryParams.endDate ? Number((new Date(queryParams.endDate).getTime() / 1000).toFixed()) : Number((new Date(queryParams.startDate).getTime() / 1000).toFixed());
		expenseFilter = _.assign(expenseFilter, {time: {$gte: startTime, $lt: (endTime + 86400) }});
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
				expense.altPrice = expense.price / _getExchangeRate(expense.time, exchangeRates);
			}
			else expense.altPrice = expense.price * _getExchangeRate(expense.time, exchangeRates);
			delete expense.categoryId;
			delete expense.subcategoryId;
			if(req.user.role === 'ADMIN' || req.user.admin) expense.editable = true;
			else expense.editable = _checkForEdit(expense.time);
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

function createExpense(req, res) {
	var data = actionUtil.parseValues(req);
	data.creatorId = req.user.global_id || "unknown id";
	if(!(req.user.role === 'ADMIN' || req.user.admin)) 
		if(!_checkForEdit(data.time)) return res.negotiate("This period is closed to edit");
	Expense.create(data).exec(function created (err, newInstance) {
		if (err) return res.negotiate(err);
		var log = {who: req.user.global_id, action: 'created', type: 'expense', target: newInstance.id, time: Number((new Date().getTime() / 1000).toFixed())};
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

	var limit = actionUtil.parseLimit(req);
	var sort = actionUtil.parseSort(req);
	var priceSorting = sort && sort.indexOf('price') > -1;
	if (priceSorting) {
		limit = 10000;
	}

	Expense.find(expenseFilter)
		.where(actionUtil.parseCriteria(req))
		.limit(limit)
		.sort(sort)
		.sort(actionUtil.parseSort(req))
		.then(function(expenses) {
			var categories = Category.find().then(function(categories) {
				return categories;
			});
			var exchangeRates = Currency.find().then(function(exchangeRates) {
				return exchangeRates;
			});
			return [expenses, categories, exchangeRates];
		}).spread(function(expenses, categories, exchangeRates) {
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
					expense.altPrice = expense.price / _getExchangeRate(expense.time, exchangeRates);
				}
				else expense.altPrice = expense.price * _getExchangeRate(expense.time, exchangeRates);
				if(req.user.role === 'ADMIN' || req.user.admin) expense.editable = true;
				else expense.editable = _checkForEdit(expense.time);
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

//privat
function _compareDays(time1, time2) {
	var date1 = new Date(time1 * 1000);
	var date2 = new Date(time2 * 1000);
	return (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate());
}

function _getExchangeRate(time, exchangeRates) {
	var rate = _.find(exchangeRates, function(exchangeRate) {
		return _compareDays(time, exchangeRate.time);
	});
	return rate ? rate.rate : exchangeRates[0].rate;
}
//false if date before 15 date of month 
function _checkForEdit(time) {	
	var now = new Date();
	var date = new Date(time * 1000);
	if(date.getFullYear() < now.getFullYear()) return false;
	if((now.getMonth() - date.getMonth()) >= 2) return false;
	if(((now.getMonth() - date.getMonth()) === 1) && now.getDate() > 15) return false;
	return true;
}
