module.exports = function(app) {
  require('./Charts.controller.js')(app);
  require('./Charts.service.js')(app);
};
