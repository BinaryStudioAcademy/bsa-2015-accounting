var angular = require('angular');

require('angular-xeditable');
require('angular-google-chart');
require('ng-sanitize');
require('ng-csv');

var app = angular.module('accounting', [
  require('angular-resource'),
  require('angular-route'),
  require('angular-ui-bootstrap'),
  'xeditable',
  "googlechart",
  'ngSanitize', 
  'ngCsv'
]);

require('./budgets/index.js')(app);
require('./categories/index.js')(app);
require('./expenses/index.js')(app);
require('./administration/index.js')(app);
require('./users/index.js')(app);
require('./currency/index.js')(app);
require('./charts/index.js')(app);
require('./shared/index.js')(app);
require('./route.js')(app);
