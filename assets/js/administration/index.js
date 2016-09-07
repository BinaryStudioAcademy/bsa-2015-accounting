module.exports = function(app) {
  require('./Administration.controller.js')(app);
  require('./Administration.service.js')(app);
};
