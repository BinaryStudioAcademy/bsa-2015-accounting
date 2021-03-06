_ = require('lodash');

module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['BudgetsService', 'YearsService', 'ExpensesService', '$q', '$rootScope'];

	function ChartsController(BudgetsService, YearsService, ExpensesService, $q, $rootScope) {
		var vm = this;
		/*vm.rate = $rootScope.exchangeRate;
		vm.currencyChangeModel = 'UAH';
		loadAllExpenses();

		vm.categories = [];
		vm.year = 0;
		vm.budgetVisible= false;
		vm.toggleBoolean = true;
		vm.displaySubcategory = displaySubcategory;
		vm.displayCategory = displayCategory;
		vm.startDateFilter = startDateFilter;
		vm.endDateFilter = endDateFilter;
		vm.toggleForm = toggleForm;
		vm.updateView = updateView

//date filter 
		function mathRound(n) {

			if (vm.currencyChangeModel === 'UAH') {
				var uahValue = n * vm.rate;
				return Math.round(uahValue)
			}else
				return Math.round(n)
		}

		function startDateFilter(startDate) {
			console.log('changed');
			 vm.startDate = startDate;
		}

		function endDateFilter(endDate) {
			console.log('changed');
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
			var filteredResult = [];*/

			/*function parseDateFromFilter(strDate) {
				return new Date(strDate);
			}*/

			// Parse the UTC time data from JSON source
			/*function parseDateFromUtc(utcStr) {
				return new Date(utcStr);
			}

			// Defaults
			//var parsedStartDate = startDate ? parseDateFromFilter(startDate) : new Date(1900, 1, 1);
			var parsedStartDate = startDate || new Date(1900, 1, 1);
			//var parsedEndDate = endDate ? parseDateFromFilter(endDate) : new Date();
			var parsedEndDate = endDate || new Date();

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
			//vm.year = String(vm.years[0]);
			vm.year = String(new Date().getFullYear());
			vm.getBudgets();
			changeCurrency();
		});


		BudgetsService.getBudgets().then(function(data) {
			vm.allBudgets = data;
			getAllBudgets();
		});
		vm.getSumBudget = function(name, year) {
			var filterSum = _.find(vm.allBudgets , function(budget) {
				return (budget.category.name === name && budget.year === year);
			});
			if (vm.currencyChangeModel == 'USD') {
				var rate = 1;
			}else {
				var rate = vm.rate;
			}
			rate = 1;/////////////////////////////////////////////////
			return filterSum ? filterSum.category.budget * rate : '-';
		}

		vm.getSumYear = function(year) {
			var filterSum = _.filter(vm.allBudgets , function(budget) {
				return (budget.year === year);
			});
			if (vm.currencyChangeModel == 'USD') {
				var rate = 1;
			}else {
				var rate = vm.rate;
			}
			rate = 1;/////////////////////////////////////////////////
			var sum = 0;
			filterSum.forEach(function(budget){
				sum += budget.category.budget;
			});
			return sum * rate;
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
			BudgetsService.getBudgets(vm.year).then(function(data) {
				vm.budgets = data;
				vm.categories = _.pluck(vm.budgets,'category');
				displayAllCategories();
			});
		}

		function displayAllCategories() {

				var names = _.pluck(vm.budgets, 'category.name');
				var planned =_.map( _.pluck(vm.budgets, 'category.budget'), mathRound);
				var spent = _.map(_.pluck(vm.budgets, 'category.used'), mathRound);
				var titleText = 'Budgets ' + vm.year + ' by categories';
				barChart(names, planned, spent, titleText, vm.budgetVisible);
				pieChart(names, planned, titleText);
		}
		vm.categoryModel = [];
		function displayCategory(categoryModel) {
			vm.categoryModel = categoryModel;

			if(vm.categoryModel === null){
					displayAllCategories ()
			} else {
				var names = _.pluck(vm.categoryModel.subcategories, 'name');
				var spent = _.map(_.pluck(vm.categoryModel.subcategories, 'used'), mathRound);
				var planned = _.map(_.pluck(vm.categoryModel.subcategories, 'budget'), mathRound);
				var titleText = vm.categoryModel.name + ' ' + vm.year +' budgets by subcategories';
				barChart(names, planned, spent, titleText, vm.budgetVisible);
				pieChart(names, planned, titleText);
			}

		}

		vm.changeSubcategoryCurrency = changeSubcategoryCurrency;
		vm.expensesBySubcategory = [];

		function changeSubcategoryCurrency () {

			return totalSubExpenses = _.reduce(vm.expensesBySubcategory, function(totalSubExpenses, exp) {
				if(vm.currencyChangeModel == 'UAH'){
					if(exp.currency =='USD'){
						return totalSubExpenses + exp.price * vm.rate;
					}
					return totalSubExpenses + exp.price;
				}else{
					if(exp.currency =='USD'){
												return totalSubExpenses + exp.price
					}
					return (totalSubExpenses + exp.price)/vm.rate;
				}

			}, 0);
		}
vm.selectedCategory = [];
		function displaySubcategory(selectedCategory) {
			vm.selectedCategory =selectedCategory
			var y = vm.startDate.getFullYear();
			var m = vm.startDate.getMonth() + 1;
			var d = vm.startDate.getDate();
			var ey = vm.endDate.getFullYear();
			var em = vm.endDate.getMonth() + 1;
			var ed = vm.endDate.getDate();
			var spentByPeriod = [];
			var titleText = 'Expenses  ' + vm.selectedCategory.name + ' by period ' + d + '.' +  m + '.' + y + ' - ' + ed + '.' +  em + '.' + ey
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
					spentByPeriod.push(Math.round(totalSubExpenses));
			});

				barChart(uniqueSubcategoryNames, planned, spentByPeriod, titleText ,vm.budgetVisible);
				pieChart(uniqueSubcategoryNames, spentByPeriod, titleText);
			}*/

		function barChart(names, planned, spent, income, titleTxt) {
			if (!planned) {
				var series = [
					{
						name: 'Expenses',
						data: spent,
						visible: true,
						colorByPoint: false
					 },
					{
						name: 'Income',
						data: income,
						visible: true,
						colorByPoint: false
					}
					];
			}
			else {
				var series = [
					{
						name: 'Expenses',
						data: spent,
						visible: true,
						colorByPoint: false
					},
					{
						name: 'Income',
						data: income,
						visible: true,
						colorByPoint: false
					},
					{
						name: 'Budgets',
						data: planned,
						visible: true,
						colorByPoint: false
					}
					];
			}
			
			$('#barChart').highcharts({
				colors: ["#f7a35c", "#90ee7e", "#7cb5ec", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
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
						text: 'Costs: '+ vm.currency,
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueSuffix: ' '+ vm.currency
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
				series: series
			});

			/*var chart = $('#barChart').highcharts();
			$('#barChart g.highcharts-legend').click(function(e){
				if (e.target.localName === "text") {
					chart.series[1].update({
						colorByPoint: !(chart.series[0].visible && chart.series[1].visible)
					});
					chart.series[0].update({
						colorByPoint: !(chart.series[0].visible && chart.series[1].visible)
					});
				}
			});*/
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
					pointFormat: '{series.name}: <b>{point.y}</b>' + ' '+ vm.currency
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



		/*function toggleForm(bool) {
			vm.toggleBoolean = bool
		}

		function updateView(){
			
			if (vm.toggleBoolean){
				vm.getBudgets();
				displayCategory(vm.categoryModel);
			}else{
				displaySubcategory(vm.selectedCategory);
			}
		}*/



		////////////////////////////////////////////////////////////


		function mathRound(price) {

			/*if (vm.currencyChangeModel === 'UAH') {
				var uahValue = n * vm.rate;
				return Math.round(uahValue)
			}else
				return Math.round(n)*/

			var rate = vm.currency === 'USD' ? 1 : $rootScope.exchangeRate;

			return Number(price.toFixed(2)) * rate;
			//return Math.round(price);
		}


		vm.rangeType = 'year';
		vm.currentYear = String(new Date().getFullYear());
		vm.year = vm.currentYear;
		vm.currency = 'USD';

		vm.updateRangeType = function() {
			if (vm.rangeType == 'dates') {
				vm.startDate = new Date('01.01.' + vm.year);
				//vm.endDate = new Date(new Date('12.31.' + vm.year).getTime() + 24*60*60*1000 - 1);
				vm.endDate = new Date('12.31.' + vm.year);
			}
			else {
				vm.year = vm.currentYear;
			}
			vm.drawCharts();
		};

		YearsService.getYears().then(function(data) {
			vm.years = data;
		});


		vm.getData = function() {
			if($rootScope.isAdmin()){
				BudgetsService.getBudgets().then(function(data) {
					vm.allBudgets = data;
					vm.budgets = _.filter(vm.allBudgets, {year: Number(vm.year)});

					vm.allCategories = _.uniq(_.pluck(vm.allBudgets, 'category.name'));
					vm.categories = _.pluck(vm.budgets, 'category');

					vm.drawCharts();
				});
			} else	{
				vm.rangeType = 'dates';
				vm.updateRangeType();
			}
		};

		vm.drawCharts = function() {
			if (vm.rangeType === 'dates') {
				var query = {};
				if (vm.startDate) {query.startDate = vm.startDate}
				if (vm.endDate) {query.endDate = vm.endDate}

				ExpensesService.getExpenses(query).then(function(data) {
					vm.expenses = data;
					////////////////////////////////
					var names = _.uniq(_.pluck(vm.expenses, 'category.name'));
					var spent = [];
					var income = [];
					names.forEach(function(name) {
						var expenses = _.filter(vm.expenses, function(expense) {
							return expense.category.name === name;
						});
						var sumSpent = 0;
						var sumIncome = 0;
						expenses.forEach(function(expense) {
							if(expense.income) {
								if (expense.currency === vm.currency) {
									sumIncome += expense.price;
								}
								else {
									sumIncome += expense.altPrice;
								}
							} else {
								if (expense.currency === vm.currency) {
									sumSpent += expense.price;
								}
								else {
									sumSpent += expense.altPrice;
								}
							}
						});
						spent.push(Number(sumSpent.toFixed(2)));
						income.push(Number(sumIncome.toFixed(2)));
					});
					var text = 'period since dinosaurs died till today';
					if (vm.startDate) {
						var y = vm.startDate.getFullYear();
						var m = vm.startDate.getMonth() + 1;
						var d = vm.startDate.getDate();
						text = d + '.' +  m + '.' + y;
					}
					if (vm.endDate) {
						var ey = vm.endDate.getFullYear();
						var em = vm.endDate.getMonth() + 1;
						var ed = vm.endDate.getDate();
						if (vm.startDate) {
							text += (' - ' + ed + '.' +  em + '.' + ey);
						}
						else {
							text = ed + '.' +  em + '.' + ey;
						}
					}
					var title = 'Expenses for ' + text + ' by categories';

					vm.pie = vm.bars = names.length > 0;
					vm.pie && barChart(names, undefined, spent, income, title);
					if($rootScope.isAdmin()) {
						vm.bars && pieChart(names, spent, title);
					}
					//////////////////////////////
				});
			}
			else {
				vm.budgets = _.filter(vm.allBudgets, {year: Number(vm.year)});
				vm.categories = _.pluck(vm.budgets, 'category');
				if (vm.category) {
					var names = _.pluck(vm.category.subcategories, 'name');
					var spent = _.map(_.pluck(vm.category.subcategories, 'used'), mathRound);
					var income = _.map(_.pluck(vm.category.subcategories, 'income'), mathRound);
					var planned = _.map(_.pluck(vm.category.subcategories, 'budget'), mathRound);
					var barsTitle = 'Budgets and expenses for ' + vm.category.name + ' ' + vm.year + ' by subcategories';
					var pieTitle = 'Budgets for ' + vm.category.name + ' ' + vm.year + ' by subcategories';
				} else {
					var names = _.pluck(vm.budgets, 'category.name');
					var planned =_.map(_.pluck(vm.budgets, 'category.budget'), mathRound);
					var spent = _.map(_.pluck(vm.budgets, 'category.used'), mathRound);
					var income = _.map(_.pluck(vm.budgets, 'category.income'), mathRound);
					var barsTitle = 'Budgets and expenses ' + vm.year + ' by categories';
					var pieTitle = 'Budgets ' + vm.year + ' by categories';
				}
				vm.pie = Boolean(_.find(planned, function(val) {return val > 0;}));
				vm.bars = vm.pie || Boolean(_.find(spent, function(val) {return val > 0;}));
				vm.pie && barChart(names, planned, spent, income, barsTitle);
				vm.bars && pieChart(names, planned, pieTitle);
			}
		};


		vm.getSumBudget = function(name, year) {
			var filterSum = _.find(vm.allBudgets , function(budget) {
				return (budget.category.name === name && budget.year === year);
			});
			return filterSum ? filterSum.category.budget : '-';
		}

		vm.getSumYear = function(year) {
			var filterSum = _.filter(vm.allBudgets , function(budget) {
				return (budget.year === year);
			});
			var sum = 0;
			filterSum.forEach(function(budget){
				sum += budget.category.budget;
			});
			return sum;
		}
		

		vm.getData();
	}
};
