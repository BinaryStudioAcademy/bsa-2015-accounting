/**
 * SettingsController
 *
 * @description :: Server-side logic for settings
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil')
var fs = require('fs');
var config = require('../../config/closingSessionDate.json');

module.exports = {
	getClosingDate: getClosingDate,
	setClosingDate: setClosingDate
};

function getClosingDate(req, res){
	fs.readFile('././config/closingSessionDate.json', 'utf8', function (err, data) {
		if (err) return res.serverError(err);
		var closeDate = JSON.parse(data);
		var date = new Date();
		date.setDate(closeDate.custom);
		var result = {date: Number((date.getTime() / 1000).toFixed())};
		return res.ok(result);
	});
}

function setClosingDate(req, res){
	var data = actionUtil.parseValues(req);

	var date = new Date(data.date * 1000)
	var text = { default : config.default, custom : date.getDate() }
	
	fs.writeFile('././config/closingSessionDate.json', JSON.stringify(text), function (err) {
		if(err) return res.serverError(err);
		else {
			return res.ok(data);
		}
	});
}