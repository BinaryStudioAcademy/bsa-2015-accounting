module.exports = function(app) {
  require('./Budget.controller.js')(app);
  require('./Budget.service.js')(app);
};
