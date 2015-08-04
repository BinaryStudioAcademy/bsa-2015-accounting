/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// blueprint API
	find: getCategories,
	destroy: softDeleteCategory
};

function getCategories(req, res) {
	Category.native(function(err, collection) {
		if(err) return res.serverError(err);

		collection.find({deletedBy: {$exists: false}}).toArray(function (err, results) {
				if(err) return res.serverError(err);
				return res.send(results);
			});
	});
}

function softDeleteCategory(req, res) {
	var responsibleUserId = "unknown user id";

	Category.update({id: req.param("id")}, {deletedBy: responsibleUserId}).exec(function(err, result) {
		if(err) return res.serverError(err);
		return res.send(result);
	});
}