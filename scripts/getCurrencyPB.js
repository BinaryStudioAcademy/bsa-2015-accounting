module.exports = function(res) {
	console.log('*** Geting currency from Privat Bank... \n*** It could take some time...');
	var _ = require('lodash');
	var https = require('https');
	var MongoClient = require('mongodb').MongoClient;
	var urlDb = 'mongodb://localhost:27017/portal-accounting';
	var apiUrl = 'https://api.privatbank.ua/p24api/exchange_rates?json&date='
	var date = new Date();
	date.setDate(date.getDate() - 365);
	var startYear = date.getFullYear();
	var startMonth = date.getMonth();
	var startDay = date.getDate();
	var d = new Date(startYear, startMonth, startDay);
	var carrenciesUrls = [];
	var currencyArr = [];
	var approximatedArr = [];

	for(var i = 0; i <= 364; i++) {
		d.setDate(d.getDate() + 1);
		var y = d.getFullYear();
		var m = d.getMonth() + 1;
		var day = d.getDate();
		var url = apiUrl + day + '.' + m + '.' + y;
		carrenciesUrls.push(url);
	}

	function callback(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('end', function() {
			var ratesData = JSON.parse(data);
			var time = Date.parse(formatDate(ratesData.date)) / 1000;
			var rates = _.find(ratesData.exchangeRate, function(obj) {
				return obj.currency == "USD";
			}) || {purchaseRate: 0};
			var rate = rates.purchaseRate || 0;
			if (rate === 0) {
				approximatedArr.push({date: ratesData.date, time: time});
			}
			currencyArr.push({time: time, rate: rate});
			if (currencyArr.length === 365) {
				currencyArr.sort(function(a, b) {
					return a.time - b.time;
				});
				for (var i = 0; i < currencyArr.length; i++) {
					currencyArr[i].rate = currencyArr[i].rate || currencyArr[i - 1].rate;
				}
				addToCollection(currencyArr);
			}
		});
	};

	carrenciesUrls.forEach(function(currenciesUrl) {
		var options = {
			host: "api.privatbank.ua",
			path: currenciesUrl
		};

		https.request(options, callback).end();
	});

	function addToCollection(rates) {
		MongoClient.connect(urlDb, function(err, database) {
			if (err) throw err;
			database.collection('currency').remove({});
			database.collection('currency').insert(rates);
			database.close();

			if (approximatedArr.length > 0) {
				approximatedArr.sort(function(a, b) {
					return a.time - b.time;
				});
				console.log('*** Rates approximated for:');
				approximatedArr.forEach(function(item) {
					console.log('***', item.date);
				});
			}
			console.log('*** Done!');
			res.send(approximatedArr);
		});
	}

	function formatDate(date) {
		return date.split(".").reverse().join(".");
	}
}