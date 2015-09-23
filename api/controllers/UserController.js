/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var _ = require('lodash');
var http = require('http');

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
	
	return res.json(req.user);
}

function getUsers(req, res) {
	http.get("http://team.binary-studio.com/profile/api/users/", function(data) {
		//var users = data.body;
		var users = JSON.parse(data);

		//User.find({deletedBy: {$exists: false}})
		//	.then(function(localUsers) {
		//		var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(categories) {
		//			return categories;
		//		});
		//		var currencies = Currency.find().then(function(currencies) {
		//			return currencies;
		//		});
		//		return [localUsers, expenses, currencies];
		//	}).spread(function(localUsers, expenses, currencies) {
		//		localUsers.forEach(function(user) {
		//			var personalExpenses = _.filter(expenses, function(expense) {
		//				return (expense.creatorId == user.global_id);
		//			});
		//			var budget = user.budget || 0;
		//			user.budget = {};
		//			user.budget.used = 0;
		//			personalExpenses.forEach(function(expense) {
		//				if (expense.currency !== "UAH") {
		//					var expDate = new Date(expense.time * 1000);
		//					var rate = _.find(currencies, function(currency) {
		//						var currDate = new Date(currency.time * 1000);
		//						return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
		//					}).rate;
		//					user.budget.used += (expense.price * rate);
		//				}
		//				else {
		//					user.budget.used += expense.price;
		//				}
		//			});
		//			user.budget.used = Number(user.budget.used.toFixed(2));
		//			user.budget.left = budget - user.budget.used;
		//		});
		//		users.forEach(function(user) {
		//			var local = _.find(localUsers, {global_id: user.serverUserId});
		//			if (local) user.id = local.id;
		//			user.admin = local ? local.admin : false;
		//			user.budget = local ? local.budget : {used: 0, left: 0};
		//			user.categories = local ? local.categories : [];
		//		});
		//		
		//		return res.send(users);
		//	}).fail(function(err) {
		//		return res.send(err);
		//	})
		return res.send(users);
	}).on('error', function(e) {
		return res.send(e);
		//console.log("Got glogal users error: " + e.message);
	});
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
