_ = require('lodash');

module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['BudgetsService', 'YearsService', 'ExpensesService', '$q', '$rootScope'];

	function ChartsController(BudgetsService, YearsService, ExpensesService, $q, $rootScope) {
		var vm = this;
		loadAllExpenses();
		getCategories();
		vm.years = [];
		vm.categories = [];
		vm.year = 0;
		vm.budgetVisible=false;
		vm.handleForm = handleForm;
		vm.displaySubcategory = displaySubcategory;
		vm.displayCategory = displayCategory;
		vm.startDateFilter = startDateFilter;
		vm.endDateFilter =endDateFilter;

//date filter 


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

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			vm.year = String(vm.years[0]);
			getBudgets(vm.year);
			getCategories(vm.year);

		});


		BudgetsService.getBudgets().then(function(data){
			vm.allBudgets = data;
			getAllBudgets();
		});

		vm.getSumBudget = function (name, year){
		
				var filterSum = _.filter(vm.allBudgets , function(budget) {
					return (budget.category.name === name && budget.year === year);
				});
					return filterSum[0].category.budget;
			}

		vm.getSumExpenses = function (name, year){

			var filterSum = _.filter(vm.allBudgets , function(budget) {
				return (budget.category.name === name && budget.year === year);
			});
			
			return filterSum[0].category.used;
			}

		function getAllBudgets() {
				vm.categoryNames = _.pluck(vm.allBudgets , 'category.name');
				vm.uniqueName = _.uniq(vm.categoryNames);
		}


		function getBudgets(year) {
			$q.all([BudgetsService.getBudgets(year), ExpensesService.getAllExpenses(year)]).then(function(results) {

				var budgets = results[0];
				var expenses = results[1];
				var names = _.pluck(budgets, 'category.name');
				var planned = _.pluck(budgets, 'category.budget');
				var spended = _.pluck(budgets, 'category.used')
				vm.year = year;
				var titleText = 'Categorys budget by ' + vm.year ;

				barChart(names, planned, spended, titleText, vm.budgetVisible);
				pieChart(names, planned, titleText);
			});

		}

		function getCategories(year) {

			BudgetsService.getBudgets(year).then(function(data) {
				var categoryList= [];
				data.forEach(function(budgets) {
					categoryList.push(budgets.category);
				});
				vm.categories = categoryList;
			});
		}

		function displayCategory(categoryModel) {

			var names = _.pluck(categoryModel.subcategories, 'name');
			var spended =_.pluck(categoryModel.subcategories, 'used');
			var planned =_.pluck(categoryModel.subcategories, 'budget');

			var titleText = 'Subcategory '+ categoryModel.name +' budget by ' + vm.year
			barChart(names, planned, spended, titleText, vm.budgetVisible);
			pieChart(names, planned, titleText);
		}

		function displaySubcategory(selectedCategory){
			var kurs = $rootScope.exchangeRate;

			var y = vm.startDate.getFullYear();
			var m = vm.startDate.getMonth();
			var d = vm.startDate.getDay()
			var ey = vm.endDate.getFullYear();
			var em = vm.endDate.getMonth();
			var ed = vm.endDate.getDay()
			var spendedByPeriod = [];
			var titleText = 'Spended ' + selectedCategory.name + ' by period ' + y + '.' +  m + '.' + d + ' - ' + ey + '.' +  em + '.' + ed
			var planned =0;
			vm.budgetVisible = true
			var filteredExpense = dateRange(vm.allExpenses, vm.startDate, vm.endDate);
			var filteredExpensesByCategory = _.filter(filteredExpense, function(expense) {
					return expense.category.name === selectedCategory.name;
			});

			var subcategorysName =_.pluck(filteredExpensesByCategory, 'subcategory.name');
			var uniqueSubcategoryNames = _.uniq(subcategorysName);


			uniqueSubcategoryNames.forEach(function(name) {
				var expensesBySubcategory = _.filter(filteredExpensesByCategory, function(expense) {
					return expense.subcategory.name === name;
				});

				var totalSubExpenses = _.reduce(expensesBySubcategory, function(totalSubExpenses, exp) {
					if(exp.currency =='USD'){
					 return totalSubExpenses + exp.price * kurs;;
					}
					return totalSubExpenses + exp.price;

				}, 0);
					spendedByPeriod.push(totalSubExpenses);
			});

				barChart(uniqueSubcategoryNames, planned, spendedByPeriod, titleText ,vm.budgetVisible);
				pieChart(uniqueSubcategoryNames, spendedByPeriod, titleText);

			}


		function barChart(names, planned, spended, titleTxt, budgetVisible) {
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
					visible: budgetVisible,
					colorByPoint: budgetVisible
				},
				{
					name: 'Budget',
					data: planned,
					visible: !budgetVisible,
					colorByPoint: !budgetVisible
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
					pointFormat: '{series.name}: <b>{point.y}</b>'
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
			getBudgets(vm.year);
		}
	}
};
