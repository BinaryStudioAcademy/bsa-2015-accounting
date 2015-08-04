/**
 * BudgetController
 *
 * @description :: Server-side logic for managing budgets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// blueprint API
	find: getBudgets,
	destroy: softDeleteBudget
};

function getBudgets(req, res) {
	Budget.native(function(err, collection) {
		if(err) return res.serverError(err);

		collection.find({deletedBy: {$exists: false}}).toArray(function (err, results) {
				if(err) return res.serverError(err);
				return res.send(results);
			});
	});
}

function softDeleteBudget(req, res) {
	var responsibleUserId = "unknown user id";

	Budget.update({id: req.param("id")}, {deletedBy: responsibleUserId}).exec(function(err, result) {
		if(err) return res.serverError(err);
		return res.send(result);
	});
}