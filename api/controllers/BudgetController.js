/**
 * BudgetController
 *
 * @description :: Server-side logic for managing budgets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	//find: getBudgets
};

function getBudgets(req, res) {
	Budget.find({deletedBy: {$exists: false}}).populateAll().exec(function(err, budgets) {
		return res.send(budgets);
	});
}