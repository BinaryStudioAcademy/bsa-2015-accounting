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
	create: createBudget
};

function getBudgets(req, res) {
	Budget.find({deletedBy: {$exists: false}})
	.where( actionUtil.parseCriteria(req) )
	.then(function(budgets) {
		var users = User.find().then(function(users) {
			return users;
		});
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		return [budgets, users, categories];
	}).spread(function(budgets, users, categories) {
		budgets.forEach(function(budget) {
			var category = _.find(categories, {id: budget.category.id});
			budget.category.name = category.name;
			budget.subcategories.forEach(function(subcategory) {
				subcategory.name = _.find(category.subcategories, {id: subcategory.id}).name;
			});
			budget.category.subcategories = budget.subcategories;
			delete budget.subcategories;
			var user = _.find(users, {id: budget.creatorId}) || {id: "unknown id", name: "unknown name"};
			budget.creator = {
				id: user.id,
				name: user.name
			};
			delete budget.creatorId;
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

//function getBudgets(req, res) {
//	Budget.native(function(err, collection) {
//		if (err) return res.serverError(err);
//		collection.aggregate([
//			{$unwind: '$subcategories'},
//			{$match: {"deletedBy": {$exists: false}, "subcategories.deletedBy": {$exists: false}}},
//			{$group: {
//				_id: '$_id',
//				creatorId: {$first: '$creatorId'},
//				categoryId: {$first: '$categoryId'},
//				budget: {$first: '$budget'},
//				year: {$first: '$year'},
//				subcategories: {$push: '$subcategories'}
//			}}
//		]);
//		return this;
//	})
//	.where( actionUtil.parseCriteria(req) )
//	.then(function(budgets) {
//		var users = User.find().then(function(users) {
//			return users;
//		});
//		var categories = Category.find().then(function(categories) {
//			return categories;
//		});
//		return [budgets, users, categories];
//	}).spread(function(budgets, users, categories) {
//		budgets.forEach(function(budget) {
//			var category = _.find(categories, {id: budget.category.id});
//			budget.category.name = category.name;
//			budget.subcategories.forEach(function(subcategory) {
//				subcategory.name = _.find(category.subcategories, {id: subcategory.id}).name;
//			});
//			budget.category.subcategories = budget.subcategories;
//			delete budget.subcategories;
//			var user = _.find(users, {id: budget.creatorId}) || {id: "unknown id", name: "unknown name"};
//			budget.creator = {
//				id: user.id,
//				name: user.name
//			};
//			delete budget.creatorId;
//		});
//		return res.send(budgets);
//	}).fail(function(err) {
//		return res.send(err);
//	}) 
//}