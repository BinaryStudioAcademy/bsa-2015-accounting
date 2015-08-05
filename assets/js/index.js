var angular = require('angular');

var app = angular.module('accounting', [require('angular-resource')]);

require('./categories/index.js')(app);
require('./expenses/index.js')(app);
require('./users/index.js')(app);
require('./currency/index.js')(app);
