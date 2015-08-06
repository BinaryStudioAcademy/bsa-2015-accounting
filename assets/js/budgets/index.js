module.exports = function(app) {
  require('./Budgets.controller.js')(app);
  require('./Budgets.service.js')(app);
};
