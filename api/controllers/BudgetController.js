/**
 * BudgetController
 *
 * @description :: Server-side logic for managing budgets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// find: getBudgets
};

// function getBudgets(req, res) {
// 	Budget.find({deletedBy: {$exists: false}}).populateAll().exec(function(err, budgets) {
// 		return res.send(budgets);
// 	});
// }

function getBudgets(req, res) {
	Budget.native(function(err, collection) {
		if (err) return res.serverError(err);

		collection.aggregate([
			{$unwind: '$subcategories'},
			{$match: {"deletedBy": {$exists: false}, "subcategories.deletedBy": {$exists: false}}},
			{$group: {
				_id: '$_id',
				creatorId: {$first: '$creatorId'},
				categoryId: {$first: '$categoryId'},
				budget: {$first: '$budget'},
				year: {$first: '$year'},
				subcategories: {$push: '$subcategories'}
			}}
		])
		.toArray(function(err, results) {
			if (err) if (err) return res.serverError(err);

			res.ok(results);
		});
	});
}