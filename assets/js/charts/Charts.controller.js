module.exports = function(app) {
  app.controller('ChartsController', ChartsController);

  ChartsController.$inject = ['ChartsService'];

  function ChartsController(ChartsService) {
    var chart1 = {};
    chart1.type = "PieChart";
    chart1.data = [
       ['Component', 'cost'],
       ['Software', 50000],
       ['Hardware', 80000]
      ];
    chart1.data.push(['Services',20000]);
    chart1.options = {
        displayExactValues: true,
        width: 400,
        height: 200,
        is3D: true,
        chartArea: {left:10,top:10,bottom:0,height:"100%"}
    };

    chart1.formatters = {
      number : [{
        columnNum: 1,
        pattern: "$ #,##0.00"
      }]
    };

    this.chart = chart1;

    this.aa=1*this.chart.data[1][1];
    this.bb=1*this.chart.data[2][1];
    this.cc=1*this.chart.data[3][1];
  }
};
