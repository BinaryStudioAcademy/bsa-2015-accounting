_ = require('lodash');

module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['ChartsService', 'YearsService', 'ExpensesService', '$q'];

	function ChartsController(ChartsService, YearsService, ExpensesService, $q) {
		var vm = this;
		loadAllExpenses();
		vm.years = [];
		vm.year = 0;

		vm.handleForm = handleForm;
		vm.displaySubcategory = displaySubcategory;

// unique element of array
	function unique(arr) {
		var obj = {};
	
		for (var i = 0; i < arr.length; i++) {
			var str = arr[i];
			obj[str] = true;
		}
	
		return Object.keys(obj);
	}

//date filter 
		vm.startDateFilter = startDateFilter;
		vm.endDateFilter =endDateFilter;

		function startDateFilter(startDate){
			 vm.startDate = startDate;
		}
		function endDateFilter(endDate){
			vm.endDate = endDate;
		}


		function loadAllExpenses() {
			ExpensesService.getExpenses().then(function(data) {
				vm.allExpenses = data;
				convertDates(vm.allExpenses);
			 });
		}

		function convertDates(array) {
			array.forEach(function(item) {
				item.time = new Date(item.time * 1000).toDateString();
			});
		}

	function dateRange(items, startDate, endDate) {
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

	vm.budgets = []


//------------
		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			vm.year = String(vm.years[0]);
			getBudgetsByYear(vm.year);
			getCategories(vm.year);
		});

		function getBudgetsByYear(year) {
			$q.all([ChartsService.getBudgetsByYear(year), ExpensesService.getAllExpenses(year)]).then(function(results) {

				vm.budgets = results[0];
				var expenses = results[1];
				var names = _.pluck(vm.budgets, 'category.name');
				var planned = _.pluck(vm.budgets, 'category.budget');
				var spended = [];

				var titleText = 'Category budget';

				names.forEach(function(name) {
					var expensesByName = _.filter(expenses, function(expense) {
						return expense.category.name === name;
					});
					
					var total = _.reduce(expensesByName, function(total, exp) {
						return total + exp.price;
					}, 0);
					spended.push(total);
				});

				barChart(names, planned, spended, titleText);
				pieChart(names, planned, titleText);
			});
		}

		vm.categories = [];
		vm.displayCategory = displayCategory;
		vm.categoryModel =[];

		getCategories();

		function getCategories(year) {

			ChartsService.getBudgetsByYear(year).then(function(data) {
				var categoryList= [];
				data.forEach(function(budgets) {
					categoryList.push(budgets.category);
				});
				vm.categories = categoryList;
			});
			console.log('test:' + vm.categoryModel);
		}

		function displayCategory(categoryModel) {
			var names = [];
			var spended =[];
			var planned =[];
			vm.categoryModel = categoryModel
			var titleText = 'Subcategory budget'
			vm.categoryModel.subcategories.forEach(function(subcategory) {
				names.push(subcategory.name);
				spended.push(subcategory.used);
				planned.push(subcategory.budget);
			});

					barChart(names, planned, spended, titleText);
					pieChart(names, planned, titleText);
			}

			function displaySubcategory(){
				var spendedByPeriod = [];
				
				var filteredExpense = dateRange(vm.allExpenses, vm.startDate, vm.endDate);
				var filteredExpensesByCategory = _.filter(filteredExpense, function(expense) {
					return expense.category.name === vm.categoryModel.name;
				});
	
				var subcategorysName =_.pluck(filteredExpensesByCategory, 'subcategory.name');
				var uniqueSubcategoryNames = unique(subcategorysName);
				console.log(uniqueSubcategoryNames);
	
	
				uniqueSubcategoryNames.forEach(function(name) {
					var expensesBySubcategory = _.filter(filteredExpensesByCategory, function(expense) {
						return expense.subcategory.name === name;
					});
					var totalSubExpenses = _.reduce(expensesBySubcategory, function(totalSubExpenses, exp) {
						return totalSubExpenses + exp.price;
					}, 0);
					spendedByPeriod.push(totalSubExpenses);
				});
	
	

				console.log(spendedByPeriod);


			}




		function barChart(names, planned, spended, titleTxt) {
			$('#barChart').highcharts({
				colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
				chart: {
					type: 'bar'
				},
				title: {
					text: titleTxt
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

		function pieChart(names, planned, titleTxt) {
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
					text: titleTxt
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
			//getCategories(vm.year)

		}
	}
};
