var angular = require('angular');

require('angular-xeditable');
require('angular-sanitize');
require('ng-csv');

var app = angular.module('accounting', [
  require('angular-resource'),
  require('angular-route'),
  require('angular-ui-bootstrap'),
  'xeditable',
  'ngSanitize',
  'ngCsv'
]);

require('./budgets/index.js')(app);
require('./categories/index.js')(app);
require('./expenses/index.js')(app);
require('./administration/index.js')(app);
require('./bin/index.js')(app);
require('./users/index.js')(app);
require('./currency/index.js')(app);
require('./charts/index.js')(app);
require('./personal/index.js')(app);
require('./history/index.js')(app);
require('./shared/index.js')(app);
require('./route.js')(app);

var getHeader = function() {
var request = new XMLHttpRequest();
request.open('GET', 'http://team.binary-studio.com/app/header', true);
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState != 4) return;
        if (request.status != 200) {
            alert(request.status + ': ' + request.statusText);
        } else {
           var headerHtml = request.responseText;
           var headerContainer = document.getElementById('header');
           headerContainer.innerHTML =headerHtml;
           headerFunction();
        }
    };
};
getHeader();
