var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var _ = require('lodash');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
	find: getBudgets,
	create: createBudget,
	update: updateBudget,
	findDeleted: getDeleted
};

function getBudgets(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');
	var filter = {deletedBy: {$exists: false}}
	var budgetFilter = req.user.admin ? filter : _.assign(filter, {'category.id': {$in: permissions}});

	Budget.find(budgetFilter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var users = User.find(filter).then(function(users) {
			return users;
		});
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var year = actionUtil.parseCriteria(req).year
		if (year) {
			var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
			var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
			filter = {deletedBy: {$exists: false}, time: {$gte: start, $lte: end }};
		}
		var expenses = Expense.find(filter).then(function(categories) {
			return categories;
		});
		var currencies = Currency.find(filter).then(function(currencies) {
			return currencies;
		});
		return [budgets, users, categories, expenses, currencies];
	}).spread(function(budgets, users, categories, expenses, currencies) {
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
			var user = _.find(users, {id: budget.creatorId}) || {id: "unknown id", name: "unknown name"};
			budget.creator = {
				id: user.id,
				name: user.name
			};
			delete budget.creatorId;

			budget.category.used = 0;
			var distributed = 0;
			budget.category.subcategories.forEach(function(subcategory) {
				var subExpenses = _.filter(expenses, function(expense) {
					var expDate = new Date(expense.time * 1000);
					return (expense.subcategoryId == subcategory.id && expDate.getFullYear() == budget.year);
				});
				subcategory.used = 0;
				subExpenses.forEach(function(subExpense) {
					if (subExpense.currency !== "USD") {
						var subexpDate = new Date(subExpense.time * 1000);
						var rate = _.find(currencies, function(currency) {
							var currDate = new Date(currency.time * 1000);
							return ((currDate.getFullYear() === subexpDate.getFullYear()) && (currDate.getMonth() === subexpDate.getMonth()) && (currDate.getDate() === subexpDate.getDate()));
						}).rate;
						subcategory.used += (subExpense.price / rate);
					}
					else {
						subcategory.used += subExpense.price;
					}
				});
				budget.category.used += subcategory.used;
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
	data.creatorId = req.session.passport.user || "unknown id";
	Budget.create(data).exec(function created (err, newInstance) {
		if (err) return res.negotiate(err);
		res.created(newInstance);
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
				_.find(budget.subcategories, {id: values.delSubcategory.id}).deletedBy = req.session.passport.user || "unknown id";
			}

			budget.save(function (err) {
				if (err) return res.serverError(err);
			});
			res.ok(budget);
		});
	}
}

function getDeleted(req, res) {
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level == 3;
	}), 'id');
	var budgetFilter = req.user.admin ? {} : {'category.id': {$in: permissions}};

	Budget.find(budgetFilter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var users = User.find({deletedBy: {$exists: false}}).then(function(users) {
			return users;
		});
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		var year = actionUtil.parseCriteria(req).year;

		return [budgets, users, categories];
	}).spread(function(budgets, users, categories) {
		var deletedStuff = {
			budgets: [],
			subcategories: []
		};

		budgets.forEach(function(budget) {
			if (budget.deletedBy) {
				var category = _.find(categories, {id: budget.category.id});
				budget.category.name = category.name;

				var user = _.find(users, {id: budget.creatorId}) || {id: "unknown id", name: "unknown name"};
				budget.creator = {
					id: user.id,
					name: user.name
				};
				delete budget.creatorId;

				user = _.find(users, {id: budget.deletedBy}) || {id: "unknown id", name: "unknown name"};
				budget.deletedBy = {
					id: user.id,
					name: user.name
				};
				delete budget.year;
				delete budget.subcategories;
				deletedStuff.budgets.push(budget);
			}
			else {
				budget.subcategories.forEach(function(subcategory) {
					if (subcategory.deletedBy) {
						var user = _.find(users, {id: subcategory.deletedBy}) || {id: "unknown id", name: "unknown name"};
						var category = _.find(categories, {id: budget.category.id});
						deletedStuff.subcategories.push({
							budgetId: budget.id,
							categoryName: category.name,
							id: subcategory.id,
							budget: subcategory.budget,
							name: _.find(category.subcategories, {id: subcategory.id}).name,
							deletedBy: {
								id: user.id,
								name: user.name
							}
						});
					}
				});
			}
		});
		return res.send(deletedStuff);
	}).fail(function(err) {
		return res.send(err);
	}) 
}