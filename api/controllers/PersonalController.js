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
      events.forEach(function(event){
        event.editable = _checkForEdit(event.time);
      });
      return res.send(events);
  });
}

function changeUserBudgetHistory(req, res) {
  var pk = actionUtil.requirePk(req);
  var values = actionUtil.parseValues(req);
  console.log('pk', pk);
  console.log('data', values);
  if(!(req.user.role === 'ADMIN' || req.user.admin)) {
		if(!data.personal) return res.negotiate("You don't have rights to change history.")
		if(!_checkForEdit(data.time)) return res.negotiate("This period is closed to edit.");
	}
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

//false if date before 15 date of month 
function _checkForEdit(time) {	
	var now = new Date();
	var date = new Date(time * 1000);
	if(date.getFullYear() < now.getFullYear()) return false;
	if((now.getMonth() - date.getMonth()) >= 2) return false;
	if(((now.getMonth() - date.getMonth()) === 1) && now.getDate() > 15) return false;
	return true;
}

