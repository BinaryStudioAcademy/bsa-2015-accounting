/**
 * YearsController
 *
 * @description :: Server-side logic for managing years
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: getAllYears
};

function getAllYears(req, res) {
	Budget.native(function(err, collection) {
		if (err) return res.serverError(err);

		collection.aggregate([
			{$group: {
					_id: 0,
					years: {$addToSet:  '$year'}
				}
			}
		]).toArray(function(err, results) {
			if (err) if (err) return res.serverError(err);

			res.ok(results[0].years);
		});
	});
}