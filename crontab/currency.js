module.exports = {
  run: function() {
    var https = require('https');
    var options = {
      host: "api.privatbank.ua",
      path: "/p24api/pubinfo?json&exchange&coursid=5"
    };

    var callback = function(response) {
      var data = '';

      response.on('data', function(chunk) {
        data += chunk;
      });

      response.on('end', function() {
        var rates = JSON.parse(data);
        var rate = rates.filter(function(obj) {
          return obj.ccy == "USD";
        });
        addToCollection(rate[0].buy);
      });
    };

    https.request(options, callback).end();

    function addToCollection(exchangeRate) {
      var timeStamp = Math.round(new Date().getTime() / 1000);
      Currency.create({time: timeStamp, rate: exchangeRate}).exec(function createCB(error) {
        if(error != null) console.log(error);
      });
    }
  }
};
