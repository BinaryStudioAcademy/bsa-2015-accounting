/**
 * BudgetController
 *
 * @description :: Server-side logic for managing budgets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
    _ = require('lodash');

module.exports = {
	find: getBudgets,
	create: createBudget,
	update: updateBudget
};

function getBudgets(req, res) {
	var filter = {deletedBy: {$exists: false}};
	Budget.find(filter)
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var users = User.find(filter).then(function(users) {
			return users;
		});
		var categories = Category.find(filter).then(function(categories) {
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
		return [budgets, users, categories, expenses];
	}).spread(function(budgets, users, categories, expenses) {
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

			var catUsed = 0;
			var distributed = 0;
			budget.category.subcategories.forEach(function(subcategory) {
				var subExpenses = _.filter(expenses, function(expense) {
					return expense.subcategoryId == subcategory.id;
				});
				var subUsed = 0;
				subExpenses.forEach(function(subExpense) {
					subUsed += subExpense.price;
				});
				catUsed += subUsed;
				distributed += subcategory.budget;
				subcategory.used = subUsed;
			});
			budget.category.used = catUsed;
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