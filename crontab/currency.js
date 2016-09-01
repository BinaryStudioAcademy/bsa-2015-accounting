module.exports = {
  run: function() {
    var https = require('https');
    var options = {
      host: "api.privatbank.ua",
      //Наличный курс Приватбанка (в отделениях):
      path: "/p24api/pubinfo?json&exchange&coursid=5"
      //Безналичный курс Приватбанка (конвертация по картам, Приват24, пополнение вкладов):
      //path: "p24api/pubinfo?exchange&json&coursid=11"
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
        addToCollection(rate[0].sale);
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
