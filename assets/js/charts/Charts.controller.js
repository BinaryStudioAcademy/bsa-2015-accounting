_ = require('lodash');

module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['ChartsService', 'YearsService', 'ExpensesService', '$q'];

	function ChartsController(ChartsService, YearsService, ExpensesService, $q) {
		var vm = this;

		vm.years = [];
		vm.year = 0;

		vm.handleForm = handleForm;

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			vm.year = String(vm.years[0]);

			getBudgetsByYear(vm.year);
		});
		function getBudgetsByYear(year) {
			$q.all([ChartsService.getBudgetsByYear(year), ExpensesService.getAllExpenses(year)]).then(function(results) {
				var budgets = results[0];
				
				console.log(budgets);
				
				var expenses = results[1];
				var names = _.pluck(budgets, 'category.name');
				var planned = _.pluck(budgets, 'category.budget');
				var spended = [];

				names.forEach(function(name) {
					var expensesByName = _.filter(expenses, function(expense) {
						return expense.category.name === name;
					});
					var total = _.reduce(expensesByName, function(total, exp) {
						return total + exp.price;
					}, 0);
					spended.push(total);
				});
				
				barChart(names, planned, spended);
				pieChart(names, planned);
			});
		}
		//--------------------------------------------
/*		vm.updateYear = function() {
			var budgetsPromise = BudgetsService.getBudgets(vm.year);
		}*/
		vm.categories = [];
		vm.getSubcategories = getSubcategories;


		getCategories();

		function getCategories() {
				var budgetsPromise = ChartsService.getBudgetsByYear(2006);
				console.log(budgetsPromise);
			ExpensesService.getCategories().then(function(data) {
				data.forEach(function(category) {
					vm.categories.push(category);
				});
			});
		}
		//-------------------------------------------
		function getSubcategories(categoryModel) {
			console.log(categoryModel);
		}

		function barChart(names, planned, spended) {
			$('#barChart').highcharts({
				colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
				chart: {
					type: 'bar'
				},
				title: {
					text: 'Budget by category'
				},
				xAxis: {
					categories: names,
					title: {
						text: null
					}
				},
				yAxis: {
					min: 0,
					title: {
						text: 'Costs, $',
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueSuffix: '$'
				},
				plotOptions: {
					bar: {
						dataLabels: {
							enabled: true
						}
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: -40,
					y: 80,
					floating: true,
					borderWidth: 1,
					backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
					shadow: true
				},
				credits: {
					enabled: false
				},
				series: [ {
					name: 'Expenses',
					data: spended,
					visible: false
				},
				{
					name: 'Budget',
					data: planned,
					colorByPoint: true
				} ]
			});

			var chart = $('#barChart').highcharts();
			$('#barChart g.highcharts-legend').click(function(e){
				if (e.target.localName === "text") {
					chart.series[1].update({
						colorByPoint: !(chart.series[0].visible && chart.series[1].visible)
					});
					chart.series[0].update({
						colorByPoint: !(chart.series[0].visible && chart.series[1].visible)
					});
				}
			});
		}

		function pieChart(names, planned) {
			var data = [];
			_.times(names.length, function(i) {
				data.push({name: names[i], y: planned[i]})
			});

			$('#pieChart').highcharts({
				colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false,
					type: 'pie'
				},
				title: {
					text: 'Budget by category'
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							format: '<b>{point.name}</b>: {point.percentage:.1f} %',
							style: {
								color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
							}
						}
					}
				},
				series: [{
					name: "Category",
					colorByPoint: true,
					data: data
				}]
			});
		}

		function handleForm() {
			getBudgetsByYear(vm.year);
		}
	}
};
