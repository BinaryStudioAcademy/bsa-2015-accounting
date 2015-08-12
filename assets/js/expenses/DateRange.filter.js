module.exports = function(app) {
  app.filter('dateRange', dateRange);

  function dateRange() {
    return function(items, startDate, endDate) {
      var filteredResult = [];

      function parseDateFromFilter(strDate) {
        return new Date(strDate);
      }

      // Parse the UTC time data from JSON source
      function parseDateFromUtc(utcStr) {
        return new Date(utcStr);
      }

      // Defaults
      var parsedStartDate = startDate ? parseDateFromFilter(startDate) : new Date(1900, 1, 1);
      var parsedEndDate = endDate ? parseDateFromFilter(endDate) : new Date();

      // Take action if the filter elements are filled
      if (startDate || endDate) {
        items.forEach(function(item) {

          if (parseDateFromUtc(item.time) >= parsedStartDate && parseDateFromUtc(item.time) <= parsedEndDate) {
            filteredResult.push(item);
          }
        });

      } else {
        return items; // By default, show the regular table data
      }

      return filteredResult;
    }
  }
};
