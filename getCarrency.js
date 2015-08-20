console.log('*** Geting carwncy from Privat Bank... \n*** It could take some time...');
_ = require('lodash');
var https = require('https');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var urlDb = 'mongodb://localhost:27017/portal-accounting';



var apiUrl = 'https://api.privatbank.ua/p24api/exchange_rates?json&date='
var date = new Date()
date.setDate(date.getDate() - 360)
var startYear = date.getFullYear();
var startMonth = date.getMonth();
var startDay = date.getDate();
var d = new Date(startYear, startMonth, startDay);

var carrenciesUrls = [];
var currencyArr = []

for(var i = 0; i <= 365; i++){
	d.setDate(d.getDate() + 1);
	var y = d.getFullYear();
	var m = d.getMonth();
	var day = d.getDate();
	var url = apiUrl + day + '.' + m + '.' + y;
	carrenciesUrls.push(url);
};
var counter = 0;

var callback = function(response) {
	var data = '';
	response.on('data', function(chunk) {
		data += chunk;
	});

	response.on('end', function() {
		var rates = JSON.parse(data);
		var rate = _.filter(rates.exchangeRate, function(obj) {
			obj.date = new Date(rates.date).getTime()

			return obj.currency == "USD";
		});
		console.log(rate[0]);
		currencyArr.push(rate[0]);
		counter++;

		if (counter < 2){
			var options = {
				host: "api.privatbank.ua",
				path: carrenciesUrls[counter]
			}
			
			https.request(options, callback).end();

		}else{

			console.log(currencyArr);
		}

	});

};

/*carrenciesUrls.forEach( function(carrenciesUrl){*/

	var options = {
		host: "api.privatbank.ua",
		path: carrenciesUrls[counter]
	};

	https.request(options, callback).end();

/*})*/

