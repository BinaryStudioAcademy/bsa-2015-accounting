module.exports = function(app) {
	app.controller('ChartsController', ChartsController);

	ChartsController.$inject = ['ChartsService'];

	function ChartsController(ChartsService) {
		var vm = this;

		vm.barChart = {};
		vm.barChart.type = "BarChart";
		vm.barChart.options = {
			'title': "Budgets"
		};

		vm.pieChart = {};
		vm.pieChart.type = "PieChart";
		vm.pieChart.options = {
			'title': "Budgets"
		};

		vm.years = [];
		vm.selectedYear = 0;
		vm.barChartData = [];
		vm.tableData = [];
		vm.getBudgetsByYear = getBudgetsByYear;
		vm.toggleTable = toggleTable;

			vm.viewTable = true;
		function toggleTable(){
			vm.viewTable = vm.viewTable === false ? true: false;
		}
		ChartsService.getBudgets().then(function(data) {
			// Get all years
			data.forEach(function(budget) {
				if(vm.years.indexOf(String(budget.year)) < 0) vm.years.push(String(budget.year));
			});

			// Load start chart data
			vm.selectedYear = vm.years[vm.years.length - 1];
			getBudgetsByYear();
		});

		function getBudgetsByYear() {
			ChartsService.getBudgetsByYear(vm.selectedYear).then(function(data) {
				data.forEach(function(budget) {
					vm.barChartData = [];
					vm.tableData = [];

					// Subcategory budgets(expenses)
					var subcategoriesBudgets = [];
					budget.subcategories.forEach(function(subcategory) {
						subcategoriesBudgets.push(subcategory.budget);
					});

					// Get category by id in the current budget
					ChartsService.getCategory(budget.categoryId.id).then(function(data) {
						// Push data for the bar chart
						vm.barChartData.push({c: [{v: data.name}, {v: budget.budget}]});

						// Table data
						// Subcategory names
						var subcategoriesNames = [];
						data.subcategories.forEach(function(subcategory) {
							subcategoriesNames.push(subcategory.name);
						});
						// Push data for the table
						vm.tableData.push({name: data.name, subcategories: subcategoriesNames,
							expenses: subcategoriesBudgets, total: budget.budget});
					});
				});
				updateBarChartData(vm.barChartData);
				updatePieChartData(vm.barChartData);
			});
		}
 
		function updateBarChartData(chartData) {
			vm.barChart.data = {
				"cols":
					[
						{id: "category", label: "Category", type: "string"},
						{id: "expense", label: "Expense", type: "number"}
					],
				"rows": chartData
			};
		}

		function updatePieChartData(chartData) {
			vm.pieChart.data = {
				"cols":
					[
						{id: "category", label: "Category", type: "string"},
						{id: "expense", label: "Expense", type: "number"}
					],
				"rows": chartData
			};
		}
	}
};
