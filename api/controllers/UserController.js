/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var _ = require('lodash');

module.exports = {
	find: getUsers,
	update: updateUser,
	getCurrentUser: getCurrentUser
};

function getCurrentUser(req, res) {
	// if(!req.decoded) return res.forbidden();

	req.user.max_level = req.user.role === 'ADMIN' || req.user.admin ? 10 : _.max(req.user.categories, function(pr) {
		return pr.level;
	}).level || 0;
	Currency.find().then(function(currencies) {
		var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(categories) {
			return categories;
		});
		return [expenses, currencies];
	}).spread(function(expenses, currencies) {
		var personalExpenses = _.filter(expenses, function(expense) {
			return (expense.creatorId == req.user.id);
		});
		var budget = req.user.budget || 0;
		req.user.budget = {};
		req.user.budget.used = 0;
		personalExpenses.forEach(function(expense) {
			if (expense.currency !== "UAH") {
				var expDate = new Date(expense.time * 1000);
				var rate = _.find(currencies, function(currency) {
					var currDate = new Date(currency.time * 1000);
					return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
				}).rate;
				req.user.budget.used += (expense.price * rate);
			}
			else {
				req.user.budget.used += expense.price;
			}
		});
		req.user.budget.used = Number(req.user.budget.used.toFixed(2));
		req.user.budget.left = budget - req.user.budget.used;
		return res.json(req.user);
	});
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
				var personalExpenses = _.filter(expenses, function(expense) {
					return (expense.creatorId == user.id);
				});
				var budget = user.budget || 0;
				user.budget = {};
				user.budget.used = 0;
				personalExpenses.forEach(function(expense) {
					if (expense.currency !== "UAH") {
						var expDate = new Date(expense.time * 1000);
						var rate = _.find(currencies, function(currency) {
							var currDate = new Date(currency.time * 1000);
							return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
						}).rate;
						user.budget.used += (expense.price * rate);
					}
					else {
						user.budget.used += expense.price;
					}
				});
				user.budget.used = Number(user.budget.used.toFixed(2));
				user.budget.left = budget - user.budget.used;
			});
			return res.send(users);
		}).fail(function(err) {
			return res.send(err);
		})
}

function updateUser(req, res) {
	var pk = actionUtil.requirePk(req);
	var values = actionUtil.parseValues(req);

	var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
	if (!idParamExplicitlyIncluded) delete values.id;

	User.findOne(pk).exec(function (err, user) {
		if (err) return res.serverError(err);
		if (!user) return res.notFound();

		var action = 'edited';
		if ((values.setAdminStatus === true || values.setAdminStatus === false) && (req.user.role === 'ADMIN' || req.user.admin)) {
			user.admin = values.setAdminStatus;
		}

		if (values.setPermissionLevel) {
			action = 'changed permissions';
			var cat = _.find(user.categories, {id: values.setPermissionLevel.id});
			if (cat) {
				cat.level = values.setPermissionLevel.level;
			}
			else {
				user.categories.push(values.setPermissionLevel);
			}
		}

		if (values.editPersonalBudget) {
			if (values.editPersonalBudget > 0) {
				action = 'gave ' + values.editPersonalBudget + ' UAH';
			} else {
				action = 'took ' + (-values.editPersonalBudget) + ' UAH';
			}
			if (user.budget) {user.budget += values.editPersonalBudget;}
			else user.budget = values.editPersonalBudget;
		}

		//if (values.setName) {
		//	user.name = values.setName;
		//}

		var log = {who: req.user.id, action: action, type: 'user',
			target: user.id, time: Number((new Date().getTime() / 1000).toFixed())};

		user.save(function (err) {
			if (err) return res.serverError(err);

			History.create(log).exec(function(errr, log) {
				if (errr) return res.negotiate(err);
				res.ok(user);
			});
		});
	});
}
