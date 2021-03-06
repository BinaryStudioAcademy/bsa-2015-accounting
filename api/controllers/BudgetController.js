var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var _ = require('lodash');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
	find: getBudgets,
	create: createBudget,
	update: updateBudget,
	findDeleted: getDeleted,
	getBudgetCategories: getBudgetCategories
};

function getBudgets(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');

	var budgetFilter = {deletedBy: {$exists: false}};
	var filter = {deletedBy: {$exists: false}};
	if(!(req.user.role === 'ADMIN' || req.user.admin)){
		_.assign(filter, {'categoryId': {$in: permissions}});
		_.assign(budgetFilter, {'category.id': {$in: permissions}});
	};

	Budget.find(budgetFilter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var year = actionUtil.parseCriteria(req).year;
		var timeFilter = {};
		if (year) {
			var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
			var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
			timeFilter = {'time': {$gte: start, $lte: end }};
			_.assign(filter, timeFilter);
		}
		var expenses = Expense.find(filter).then(function(expenses) {
			return expenses;
		});
		var currencies = Currency.find(timeFilter).then(function(currencies) {
			return currencies;
		});
		return [budgets, categories, expenses, currencies];
	}).spread(function(budgets, categories, expenses, currencies) {
		function getRate(time) {
			var subexpDate = new Date(time * 1000);
			var rate = _.find(currencies, function(currency) {
				var currDate = new Date(currency.time * 1000);
				return ((currDate.getFullYear() === subexpDate.getFullYear()) && (currDate.getMonth() === subexpDate.getMonth()) && (currDate.getDate() === subexpDate.getDate()));
			});

			if (!rate) {
				return getRate(time - (24 * 60 * 60));
			}
			return rate;
		}

		budgets.forEach(function(budget) {
			var category = _.find(categories, {id: budget.category.id});
			budget.category.name = category.name;
			var subcategories = [];
			budget.subcategories.forEach(function(subcategory) {
				if (!subcategory.deletedBy) {
					subcategories.push({
						id: subcategory.id,
						budget: subcategory.budget,
						name: _.find(category.subcategories, {id: subcategory.id}).name
					});
				}
			});
			budget.category.subcategories = subcategories;
			delete budget.subcategories;

			budget.category.used = 0;
			budget.category.income = 0;
			var distributed = 0;
			budget.category.subcategories.forEach(function(subcategory) {
				var subExpenses = _.filter(expenses, function(expense) {
					var expDate = new Date(expense.time * 1000);
					return (expense.subcategoryId == subcategory.id && expDate.getFullYear() == budget.year);
				});
				subcategory.used = 0;
				subcategory.income = 0;
				subExpenses.forEach(function(subExpense) {
					if (subExpense.income) {
						if (subExpense.currency !== "USD") {
							if(subExpense.exchangeRate) var rate = subExpense.exchangeRate;
							else var rate = getRate(subExpense.time).rate;
							subcategory.income += Number((subExpense.price / rate).toFixed(2));
						}
						else {
							subcategory.income += subExpense.price;
						}
					} else {
						if (subExpense.currency !== "USD") {
							if(subExpense.exchangeRate) var rate = subExpense.exchangeRate;
							else var rate = getRate(subExpense.time).rate;
							subcategory.used += Number((subExpense.price / rate).toFixed(2));
						}
						else {
							subcategory.used += subExpense.price;
						}
					}
				});
				budget.category.used += subcategory.used;
				budget.category.income += subcategory.income;
				distributed += subcategory.budget;
			});
			budget.category.undistributed = budget.category.budget - distributed;
		});
		return res.send(budgets);
	}).fail(function(err) {
		return res.send(err);
	}) 
}

function createBudget(req, res) {
	var data = actionUtil.parseValues(req);
	data.creatorId = req.user.global_id || "unknown id";
	Budget.create(data).exec(function created (err, newInstance) {
		if (err) return res.negotiate(err);
		var log = {who: req.user.global_id, action: 'created', type: 'budget', 
			target: newInstance.id, time: Number((new Date().getTime() / 1000).toFixed())};

		History.create(log).exec(function(err, log) {
			if (err) return res.negotiate(err);
			res.created(newInstance);
		});
	});
}

function updateBudget(req, res) {
	var pk = actionUtil.requirePk(req);
	var values = actionUtil.parseValues(req);

	var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
	if (!idParamExplicitlyIncluded) delete values.id;

	if (values.restore) {
		Budget.native(function(err, collection) {
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

	else {
		Budget.findOne(pk).exec(function (err, budget) {
			if (err) return res.serverError(err);
			if (!budget) return res.notFound();

			if (values.setBudget) {
				budget.category.budget = values.setBudget.budget;
			}

			if (values.setSubBudget) {
				_.find(budget.subcategories, {id: values.setSubBudget.id}).budget = values.setSubBudget.budget;
			}

			if (values.addSubcategory) {
				budget.subcategories.push(values.addSubcategory);
			}

			if (values.delSubcategory) {
				_.find(budget.subcategories, function(sub) {
					return sub.id == values.delSubcategory.id && !sub.deletedBy;
				}).deletedBy = req.user.global_id || "unknown id";
			}

			if (values.restoreSubcategory) {
				delete _.find(budget.subcategories, function(sub) {
					return sub.id == values.restoreSubcategory.id && sub.budget == values.restoreSubcategory.budget;
				}).deletedBy;
			}

			budget.save(function (err) {
				if (err) return res.serverError(err);
			});
			var log = {who: req.user.global_id, action: 'edited', type: 'budget', 
				target: budget.id, time: Number((new Date().getTime() / 1000).toFixed())};
			History.create(log).exec(function(err, log) {
				if (err) return res.negotiate(err);

				res.ok(budget);
			});
		});
	}
}

function getDeleted(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level == 3;
	}), 'id');
	var budgetFilter = req.user.role === 'ADMIN' || req.user.admin ? {} : {'category.id': {$in: permissions}};

	Budget.find(budgetFilter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var year = actionUtil.parseCriteria(req).year;

		return [budgets, categories];
	}).spread(function(budgets, categories) {
		var deletedStuff = {
			budgets: [],
			subcategories: []
		};

		budgets.forEach(function(budget) {
			if (budget.deletedBy) {
				var category = _.find(categories, {id: budget.category.id});
				budget.category.name = category.name;
				delete budget.year;
				delete budget.subcategories;
				deletedStuff.budgets.push(budget);
			}
			else {
				budget.subcategories.forEach(function(subcategory) {
					if (subcategory.deletedBy) {
						var category = _.find(categories, {id: budget.category.id});
						deletedStuff.subcategories.push({
							budgetId: budget.id,
							categoryId: category.id,
							categoryName: category.name,
							id: subcategory.id,
							budget: subcategory.budget,
							name: _.find(category.subcategories, {id: subcategory.id}).name,
							deletedBy: subcategory.deletedBy
						});
					}
				});
			}
		});
		return res.send(deletedStuff);
	}).fail(function(err) {
		return res.send(err);
	});
}

function getBudgetCategories(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');

	var budgetFilter = {deletedBy: {$exists: false}};
	if(!(req.user.role === 'ADMIN' || req.user.admin)){
		_.assign(budgetFilter, {'category.id': {$in: permissions}});
	};

	Budget.find(budgetFilter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var year = actionUtil.parseCriteria(req).year;
		if (year) {
			var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
			var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
		}		
		return [budgets, categories];
	}).spread(function(budgets, categories) {
		budgets.forEach(function(budget) {
			var category = _.find(categories, {id: budget.category.id});
			budget.category.name = category.name;
			var subcategories = [];
			budget.subcategories.forEach(function(subcategory) {
				if (!subcategory.deletedBy) {
					subcategories.push({
						id: subcategory.id,
						name: _.find(category.subcategories, {id: subcategory.id}).name
					});
				}
			});
			budget.category.subcategories = subcategories;
			delete budget.subcategories;
			delete budget.category.budget;
		});
		return res.send(budgets);
	}).fail(function(err) {
		return res.send(err);
	}) 
}