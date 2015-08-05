module.exports = function(app) {
  require('./Users.controller.js')(app);
  require('./Users.service.js')(app);
};
