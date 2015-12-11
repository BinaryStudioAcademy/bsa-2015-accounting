var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');

/**
 * PersonalController
 *
 * @description :: Server-side logic for managing Personals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getPersonalHistory: getPersonalHistory
};

function getPersonalHistory(req, res) {
  History.find({type: "user", target: req.user.global_id})
    .sort(actionUtil.parseSort(req))
    .then(function(events) {
      return res.send(events);
  });
}

