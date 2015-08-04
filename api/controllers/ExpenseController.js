/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// blueprint API
	find: getExpenses,
	destroy: softDeleteExpense
};

function getExpenses(req, res) {
	Expense.native(function(err, collection) {
		if(err) return res.serverError(err);

		collection.find({deletedBy: {$exists: false}}).toArray(function (err, results) {
				if(err) return res.serverError(err);
				return res.send(results);
			});
	});
}

function softDeleteExpense(req, res) {
	var responsibleUserId = "unknown user id";

	Expense.update({id: req.param("id")}, {deletedBy: responsibleUserId}).exec(function(err, result) {
		if(err) return res.serverError(err);
		return res.send(result);
	});
}