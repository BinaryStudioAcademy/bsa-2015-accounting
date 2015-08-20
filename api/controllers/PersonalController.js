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
  History.find({type: "user", target: req.session.passport.user})
    .sort(actionUtil.parseSort(req))
    .then(function(events) {
    var users = User.find().then(function(users) {
      return users;
    });
    var categories = Category.find().then(function(categories) {
      return categories;
    });
    return [events, users, categories];
  }).spread(function(events, users, categories) {
    var userName;
    var categoryName;
    events.forEach(function(event) {
      categoryName = _.find(categories, {id: event.category}).name;
      userName = _.find(users, {id: event.who}).name;
      event.who = userName;
      event.category = categoryName;
    });
    res.send(events);
  }).fail(function(err) {
    return res.send(err);
  });
}

