/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getCurrentUser: getCurrentUser
};

function getCurrentUser(req, res) {
  if(!req.isAuthenticated()) return res.forbidden();
  return res.json(req.user);
}
