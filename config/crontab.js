module.exports.crontab = {
  '00 00 00 1-31 * *': function() {
    require('../crontab/currency.js').run();
  }
};
