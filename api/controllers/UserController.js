/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// blueprint API
	find: getUsers,
	destroy: softDeleteUser
};

function getUsers(req, res) {
	User.native(function(err, collection) {
		if(err) return res.serverError(err);

		collection.find({deletedBy: {$exists: false}}, {
			login: true,
			name: true,
			role: true
		}).toArray(function (err, results) {
			if(err) return res.serverError(err);
			return res.send(results);
		});
	});
}

function softDeleteUser(req, res) {
	var responsibleUserId = "unknown user id";

	User.update({id: req.param("id")}, {deletedBy: responsibleUserId}).exec(function(err, result) {
		if(err) return res.serverError(err);
		return res.send(result);
	});
}