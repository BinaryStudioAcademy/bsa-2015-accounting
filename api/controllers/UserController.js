/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // blueprint API
  find: getUsers
};

function getUsers(req, res) {
  User.native(function(err, collection) {
    if(err) return res.serverError(err);

      collection.find({}, {
        _id: true,
        login: true,
        name: true,
        role: true
      }).toArray(function (err, results) {
        if(err) return res.serverError(err);
        return res.send(results);
      });
  });
}

