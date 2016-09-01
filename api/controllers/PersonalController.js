var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');

/**
 * PersonalController
 *
 * @description :: Server-side logic for managing Personals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getPersonalHistory: getPersonalHistory,
  changeUserBudgetHistory: changeUserBudgetHistory
};

function getPersonalHistory(req, res) {
  History.find({type: "user", target: req.user.global_id})
    .sort(actionUtil.parseSort(req))
    .then(function(events) {
      return res.send(events);
  });
}

function changeUserBudgetHistory(req, res) {
  var pk = actionUtil.requirePk(req);
  var values = actionUtil.parseValues(req);
  console.log('pk', pk);
  console.log('data', values);

  User.findOne(pk).exec(function (err, user) {

    var action = 'edited';
    if (values.newValue > 0) {
      action = '+ ' + values.newValue + ' UAH';
    } else {
      action = '- ' + (-values.newValue) + ' UAH';
		}
		if (user.budget) {user.budget += values.newValue;}
		else user.budget = values.newValue;
		user.budget -= values.oldValue;

		user.save(function (err) {
			if (err) return res.serverError(err);

			History.findOne(values.historyId).exec(function(errr, log) {
				if (errr) return res.negotiate(err);

        log.action = action;
        log.income = {fromWho: values.fromWho, value: values.newValue};
        log.save();
        res.ok(user);
			});
		});
	});
}

