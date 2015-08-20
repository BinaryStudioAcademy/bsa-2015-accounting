var _ = require('lodash');

module.exports = function(app) {
	app.controller('BinController', BinController);

	BinController.$inject = ['BudgetsService', 'YearsService', '$q'];

	function BinController(BudgetsService, YearsService, $q) {
		var vm = this;

		YearsService.getYears().then(function(years) {
			vm.years = years.sort(function(a, b){return b - a});
			if (!vm.years.length) vm.years = [(new Date().getFullYear())];
			vm.year = String(vm.years[0]);
			vm.updateYear();
		});

		vm.updateYear = function() {
			BudgetsService.getDeletedBudgets(vm.year).then(function(data) {
				vm.deletedStuff = data || [];
			});
		};

		vm.restoreBudget = function(id, categoryId) {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				var existingBudget = _.find(budgets, {category: {id: categoryId}});
				if (existingBudget) {
					swal({
						title: "Are you sure?",
						text: "This will replace existing " + existingBudget.category.name + " budget and all of it's subcategories",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, pretty sure!",
						closeOnConfirm: true
					}, function() {
						var restorePromise = BudgetsService.editBudget(id, {restore: true});
						var deletePromise = BudgetsService.deleteBudget(existingBudget.id);

						$q.all([restorePromise, deletePromise]).then(function(data) {
							return vm.updateYear();
						});
					});
				}
				else {
					BudgetsService.editBudget(id, {restore: true}).then(function(data) {
						return vm.updateYear();
					});
				}
			});
		};

		vm.restoreSubcategory = function(id, categoryId, subcategoryId) {
			BudgetsService.getBudget(id).then(function(budget) {
				console.log(budget);
				var existingSubcategory = _.find(budget.subcategories, {id: subcategoryId});
				if (!existingSubcategory.deletedBy) {
					swal({
						title: "Are you sure?",
						text: "This will replace existing " + existingSubcategory.name + " subcategory",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, pretty sure!",
						closeOnConfirm: true
					}, function() {
						var restorePromise = BudgetsService.editBudget(id, {restoreSubcategory: {id: subcategoryId}});
						var deletePromise = BudgetsService.editBudget(id, {delSubcategory: {id: existingSubcategory.id}});

						$q.all([restorePromise, deletePromise]).then(function(data) {
							return vm.updateYear();
						});
					});
				}
				else {
					BudgetsService.editBudget(id, {restoreSubcategory: {id: subcategoryId}}).then(function(data) {
						return vm.updateYear();
					});
				}
			});
		};
	}
};