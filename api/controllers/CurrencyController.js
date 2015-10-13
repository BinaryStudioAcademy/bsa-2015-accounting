/**
 * CurrencyController
 *
 * @description :: Server-side logic for managing currencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
	find: getCurrency
};

function getCurrency(req, res) {
	var year = req.param('year');
	var filter = {deletedBy: {$exists: false}};

if (year) {
		var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
		var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
		filter = {deletedBy: {$exists: false}, time: {$gte: start, $lte: end }};
	}

	Currency.find(filter)
		.sort(actionUtil.parseSort(req))
		.limit(actionUtil.parseLimit(req))
		.exec(function found(err, currencies) {
		if (err) return res.serverError(err);
		res.ok(currencies);
	});
}
