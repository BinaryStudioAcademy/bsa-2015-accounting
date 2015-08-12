module.exports = function(app) {
  require('./Expenses.controller.js')(app);
  require('./ExpenseForm.controller.js')(app);
  require('./Expenses.service.js')(app);
  require('../categories/Categories.service.js')(app);

};
