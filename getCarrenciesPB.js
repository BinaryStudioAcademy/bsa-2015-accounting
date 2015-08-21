console.log('*** Geting carwncy from Privat Bank... \n*** It could take some time...');
_ = require('lodash');
var https = require('https');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var urlDb = 'mongodb://localhost:27017/portal-accounting';



var apiUrl = 'https://api.privatbank.ua/p24api/exchange_rates?json&date='
var date = new Date()
date.setDate(date.getDate() - 365)
var startYear = date.getFullYear();
var startMonth = date.getMonth();
var startDay = date.getDate();
var d = new Date(startYear, startMonth, startDay);
var carrenciesUrls = [];
var carrencyArr = []

for(var i = 0; i <= 364; i++){
	d.setDate(d.getDate() + 1);
	var y = d.getFullYear();
	var m = d.getMonth();
	var day = d.getDate();
	var url = apiUrl + day + '.' + m + '.' + y;
	carrenciesUrls.push(url);
};

var callback = function(response) {
	var data = '';
	response.on('data', function(chunk) {
		data += chunk;
	});

	response.on('end', function() {
		var rates = JSON.parse(data);
		var rate = _.filter(rates.exchangeRate, function(obj) {
			obj.date = Date.parse(reversString(rates.date))/1000;
			return obj.currency == "USD";
		});
		carrencyArr.push(rate[0]);

		if (carrencyArr.length === 365) {
			addToCollection(carrencyArr)
		}
		
			});

};

carrenciesUrls.forEach( function(carrenciesUrl){

	var options = {
		host: "api.privatbank.ua",
		path: carrenciesUrl
	};

	https.request(options, callback).end();
})

function addToCollection(exchangeRate) {
		MongoClient.connect(urlDb, function(err, database) {
			if (err) throw err;
			database.collection('carrencyByPeriod').remove();
			database.collection('carrencyByPeriod').insert(exchangeRate);
			database.close();
	});
console.log('Done!');
}

function reversString(date){
	return date.split(".").reverse().join(".");
}
