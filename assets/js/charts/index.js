module.exports = function(app) {
  require('./Categories.controller.js')(app);
  require('./Categories.service.js')(app);
};
