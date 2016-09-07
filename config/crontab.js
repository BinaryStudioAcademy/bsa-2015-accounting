module.exports.crontab = {
  '00 00 12 1-31 * *': function() {
    require('../crontab/currency.js').run();
  }
};
