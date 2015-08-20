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
  History.find({type: "user", target: req.session.passport.user}).then(function(events) {
    var users = User.find().then(function(users) {
      return users;
    });
    return [events, users];
  }).spread(function(events, users) {
    var userName;
    events.forEach(function(event) {
      userName = _.find(users, {id: event.who}).name;
      event.who = userName;
    });
    res.send(events);
  }).fail(function(err) {
    return res.send(err);
  });
}

