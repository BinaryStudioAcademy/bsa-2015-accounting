module.exports = function(app) {
	require('./Expenses.controller.js')(app);
	require('./Expenses.service.js')(app);
	require('./DateRange.filter.js')(app);
};
