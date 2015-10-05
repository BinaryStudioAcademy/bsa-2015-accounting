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
    var users = User.find().then(function(users) {
      return users;
    });
    return [events, users];
  }).spread(function(events, users) {
    var userWithName;
    events.forEach(function(event) {
      userWithName = _.find(users, {id: event.who});
      event.who = userWithName ? userWithName.name : 'no name';
    });
    console.log('events', events);
    res.send(events);
  }).fail(function(err) {
    return res.send(err);
  });
}

