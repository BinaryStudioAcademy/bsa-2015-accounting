_ = require('lodash');

module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['BudgetsService', 'YearsService', 'ExpensesService', '$q', '$rootScope'];

	function ChartsController(BudgetsService, YearsService, ExpensesService, $q, $rootScope) {
		var vm = this;
		vm.kurs = $rootScope.exchangeRate;
		vm.currencyChangeModel = 'UAH';
		loadAllExpenses();

		vm.categories = [];
		vm.year = 0;
		vm.budgetVisible=false;
		vm.toggleBoolean =true
		vm.displaySubcategory = displaySubcategory;
		vm.displayCategory = displayCategory;
		vm.startDateFilter = startDateFilter;
		vm.endDateFilter =endDateFilter;
		vm.toggleForm = toggleForm;
		vm.updateView = updateView

//date filter 
		function mathRound(n){

			if (vm.currencyChangeModel === 'UAH') {
				var uahValue = n * vm.kurs;
				return Math.round(uahValue)
			}else
				return Math.round(n)
		}

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
				return items;
			}

			return filteredResult;

		}
		vm.getBudgets = getBudgets;
		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			vm.year = String(vm.years[0]);
			vm.getBudgets();
			changeCurrency();
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

		vm.categories = [];
		vm.years = [];
		vm.changeCurrency = changeCurrency;

		vm.budget = [];
		
		function changeCurrency(){}
		
		function getBudgets() {
			BudgetsService.getBudgets(vm.year).then(function(results) {
				vm.budgets = results;
				vm.categories = _.pluck(vm.budgets,'category');
				 displayAllCategory ()
			});
		}

		function displayAllCategory () {

				var names = _.pluck(vm.budgets, 'category.name');
				var planned =_.map( _.pluck(vm.budgets, 'category.budget'), mathRound);
				var spended = _.map(_.pluck(vm.budgets, 'category.used'), mathRound);
				var titleText = 'Categorys budget by ' + vm.year ;
				barChart(names, planned, spended, titleText, vm.budgetVisible);
				pieChart(names, planned, titleText);
		}
		vm.categoryModel = [];
		function displayCategory(categoryModel) {
			vm.categoryModel =categoryModel

			if(vm.categoryModel === null){
					displayAllCategory ()
			}else{
				var names = _.pluck(vm.categoryModel.subcategories, 'name');
				var spended =_.map(_.pluck(vm.categoryModel.subcategories, 'used'), mathRound);
				var planned =_.map(_.pluck(vm.categoryModel.subcategories, 'budget'), mathRound);
				var titleText = 'Subcategory '+ vm.categoryModel.name +' budget by ' + vm.year
				barChart(names, planned, spended, titleText, vm.budgetVisible);
				pieChart(names, planned, titleText);
			}

		}

		vm.changeSubcategoryCurrency = changeSubcategoryCurrency;
		vm.expensesBySubcategory = [];

		function changeSubcategoryCurrency (){

			return totalSubExpenses = _.reduce(vm.expensesBySubcategory, function(totalSubExpenses, exp) {
				if(vm.currencyChangeModel == 'UAH'){
					if(exp.currency =='USD'){
						return totalSubExpenses + exp.price * vm.kurs;
					}
					return totalSubExpenses + exp.price;
				}else{
					if(exp.currency =='USD'){
												return totalSubExpenses + exp.price
					}
					return (totalSubExpenses + exp.price)/vm.kurs;
				}

			}, 0);
		}
vm.selectedCategory = [];
		function displaySubcategory(selectedCategory){
			vm.selectedCategory =selectedCategory
			var y = vm.startDate.getFullYear();
			var m = vm.startDate.getMonth();
			var d = vm.startDate.getDay()
			var ey = vm.endDate.getFullYear();
			var em = vm.endDate.getMonth();
			var ed = vm.endDate.getDay()
			var spendedByPeriod = [];
			var titleText = 'Spended ' + vm.selectedCategory.name + ' by period ' + y + '.' +  m + '.' + d + ' - ' + ey + '.' +  em + '.' + ed
			var planned =0;
			vm.budgetVisible = true
			var filteredExpense = dateRange(vm.allExpenses, vm.startDate, vm.endDate);
			var filteredExpensesByCategory = _.filter(filteredExpense, function(expense) {
					return expense.category.name === vm.selectedCategory.name;
			});

			var subcategorysName =_.pluck(filteredExpensesByCategory, 'subcategory.name');
			var uniqueSubcategoryNames = _.uniq(subcategorysName);


			uniqueSubcategoryNames.forEach(function(name) {
				vm.expensesBySubcategory = _.filter(filteredExpensesByCategory, function(expense) {
					return expense.subcategory.name === name;
				});

				changeSubcategoryCurrency ()
					console.log(totalSubExpenses);
					spendedByPeriod.push(Math.round(totalSubExpenses));
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
						text: 'Costs: '+ vm.currencyChangeModel,
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueSuffix: ' '+ vm.currencyChangeModel
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
					pointFormat: '{series.name}: <b>{point.y}</b>' + ' '+ vm.currencyChangeModel
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



		function toggleForm(bool) {
			vm.toggleBoolean = bool
		}

		function updateView(){
			
			if (vm.toggleBoolean){
				vm.getBudgets();
				displayCategory(vm.categoryModel);
			}else{
				displaySubcategory(vm.selectedCategory);
			}
		}
	}
};
