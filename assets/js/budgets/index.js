module.exports = function(app) {
  require('./Budgets.controller.js')(app);
  require('./Budgets.service.js')(app);
  require('../expenses/Expenses.service.js')(app);
};
