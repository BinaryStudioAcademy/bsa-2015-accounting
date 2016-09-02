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
	getCurrentUser: getCurrentUser,
	resetBudget: resetBudget,
	addMoneyToBudget : addMoneyToBudget
};

function getCurrentUser(req, res) {
	Expense.find({deletedBy: {$exists: false}, creatorId: req.user.global_id, personal: true})
		.then(function(expenses) {
			var currencies = Currency.find().then(function(currencies) {
				return currencies;
			});
			return [expenses, currencies];
		}).spread(function(expenses, currencies) {
				var user = _countUserBudget(req.user, expenses, currencies);
			return res.send(user);
		}).fail(function(err) {
			return res.send(err);
		});
}

function resetBudget(req, res){
	var pk = actionUtil.requirePk(req);
	User.findOne({global_id: pk}).exec(function (err, user) {
		if (err) return res.serverError(err);

		user.budget = 0;
		var action = 'Reset personal budget.';
		var log = {who: req.user.global_id, action: action, type: 'user',
			target: user.global_id, time: Number((new Date().getTime() / 1000).toFixed())};		
		user.save(function (err) {
			if (err) return res.serverError(err);			
			Expense.update({ creatorId : user.global_id }, { personal : false, })
				.exec(function(errr, expenses) {
					if (errr) return res.negotiate(errr);
				});

			History.create(log).exec(function(errr, log) {
				if (errr) return res.negotiate(errr);
				return res.ok(user);
			});
		});
	});
}

function getUsers(req, res) {
	User.find({deletedBy: {$exists: false}})
		.then(function(users) {
			var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(expenses) {
				return expenses;
			});
			var currencies = Currency.find().then(function(currencies) {
				return currencies;
			});
			return [users, expenses, currencies];
		}).spread(function(users, expenses, currencies) {
			users.forEach(function(user) {
				var personalExpenses = _.filter(expenses, function(expense) {
					return (expense.creatorId == user.global_id);
				});
				user = _countUserBudget(user, personalExpenses, currencies);
			});
			return res.send(users);
		}).fail(function(err) {
			return res.send(err);
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

		var log = {who: req.user.global_id, action: action, type: 'user',
			target: user.global_id, time: Number((new Date().getTime() / 1000).toFixed())};

		if (values.editPersonalBudget) {
			if (values.editPersonalBudget > 0) {
				action = '+ ' + values.editPersonalBudget + ' UAH';
			} else {
				action = '- ' + (-values.editPersonalBudget) + ' UAH';
			}
			if (user.budget) {user.budget += values.editPersonalBudget;}
			else user.budget = values.editPersonalBudget;
			log.income ={fromWho: values.fromUser, value: values.editPersonalBudget};
			log.action = action;
		}

		user.save(function (err) {
			if (err) return res.serverError(err);

			History.create(log).exec(function(errr, log) {
				if (errr) return res.negotiate(err);
				res.ok(user);
			});
		});
	});
}

function addMoneyToBudget(req, res) {
	var pk = actionUtil.requirePk(req);
	var values = actionUtil.parseValues(req);

	var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
	if (!idParamExplicitlyIncluded) delete values.id;

	User.findOne(pk).exec(function (err, user) {
		if (err) return res.serverError(err);
		if (!user) return res.notFound();
		var action = 'edited';
		if (values.editPersonalBudget > 0) {
			action = '+ ' + values.editPersonalBudget + ' UAH';
		} else {
			action = '- ' + (-values.editPersonalBudget) + ' UAH';
		}
		if (user.budget) {user.budget += values.editPersonalBudget;}
		else user.budget = values.editPersonalBudget;
		var log = {who: req.user.global_id, action: action, type: 'user',income: {fromWho: values.fromUser, value: values.editPersonalBudget},
			target: user.global_id, time: Number((new Date().getTime() / 1000).toFixed())};
		user.save(function (err) {
			if (err) return res.serverError(err);

			History.create(log).exec(function(errr, log) {
				if (errr) return res.negotiate(err);
				res.ok(user);
			});
		});
	});
}

function _countUserBudget(user, expenses, currencies){
	var budget = user.budget || 0;	
	user.budget = {};
	user.budget.left = budget;
	user.budget.leftUSD = budget / _getExchangeRate(Number((new Date().getTime() / 1000).toFixed()), currencies);
	user.budget.used = 0;
	user.budget.usedUSD = 0;	
	expenses.forEach(function(expense) {
		if(expense.exchangeRate) var rate = expense.exchangeRate;
		else{
			var rate = _getExchangeRate(expense.time, currencies);
		}
		if(expense.income) {
			if (expense.currency !== "UAH") {
				user.budget.left += (expense.price * rate);
				user.budget.leftUSD += expense.price;
			}
			else {
				user.budget.left += expense.price;
				user.budget.leftUSD += (expense.price / rate);
			}
			return; 
		}
		if (expense.currency !== "UAH") {
			user.budget.used += (expense.price * rate);
			user.budget.usedUSD += expense.price;
		}
		else {
			user.budget.used += expense.price;
			user.budget.usedUSD += (expense.price / rate);
		}
	});
	user.budget.used = Number(user.budget.used.toFixed(2));
	user.budget.usedUSD = Number(user.budget.usedUSD.toFixed(2));
	user.budget.left -= user.budget.used;
	user.budget.leftUSD -= user.budget.usedUSD;
	return user;
}


function _compareDays(time1, time2) {
	var date1 = new Date(time1 * 1000);
	var date2 = new Date(time2 * 1000);
	return (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate());
}

function _getExchangeRate(time, exchangeRates) {
	var rate = _.find(exchangeRates, function(exchangeRate) {
		return _compareDays(time, exchangeRate.time);
	});
	return rate ? rate.rate : exchangeRates[exchangeRates.length - 1].rate;
}