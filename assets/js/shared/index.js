module.exports = function(app) {
  require('./Years.service.js')(app);
  require('./Homepage.controller.js')(app);
};
