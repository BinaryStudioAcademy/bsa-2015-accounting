module.exports = function (app) {
	require('./History.controller.js')(app);
	require('./History.service.js')(app);
};