/**
 * BudgetController
 *
 * @description :: Server-side logic for managing budgets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
		_ = require('lodash');

module.exports = {
	find: getBudgets
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
			budget.creator = {
				id: budget.creatorId,
				name: _.find(users, {id: budget.creatorId}).name
			};
			delete budget.creatorId;
		});
		return res.send(budgets);
	}).fail(function(err) {
		return res.send(err);
	}) 
}