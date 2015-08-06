module.exports = function(app) {
  require('./Currency.controller.js')(app);
  require('./Currency.service.js')(app);
};
