module.exports = function(app) {
  require('./Personal.controller.js')(app);
  require('./Personal.service.js')(app);
};
