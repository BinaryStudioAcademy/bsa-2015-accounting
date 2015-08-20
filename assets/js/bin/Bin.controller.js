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

		vm.restoreMe = function(id, categoryId, subcategoryId, budget) {
			BudgetsService.getBudgets(vm.year).then(function(budgets) {
				var existing = _.find(budgets, {category: {id: categoryId}});
				var restorePromise = function() {
					return BudgetsService.editBudget(id, {restore: true});
				};
				var deletePromise = function() {
					return BudgetsService.deleteBudget(existing.id);
				};

				if (subcategoryId) {
					existing = _.find(existing.category.subcategories, {id: subcategoryId});
					restorePromise = function() {
						return BudgetsService.editBudget(id, {restoreSubcategory: {id: subcategoryId, budget: budget}});
					};
					deletePromise = function() {
						return BudgetsService.editBudget(id, {delSubcategory: {id: existing.id}});
					};
				}

				if (existing) {
					if (subcategoryId) {
						var mess = "There already is " + existing.name + " subcategory";
					}
					else {
						var mess = "This will replace existing " + existing.category.name + " budget and all of it's subcategories";
					}
					swal({
						title: "Are you sure?",
						text: mess,
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, pretty sure!",
						closeOnConfirm: true
					}, function() {
						deletePromise().then(function() {
							return restorePromise().then(function() {
								return vm.updateYear();
							});
						});
					});
				}
				else {
					restorePromise().then(function(data) {
						return vm.updateYear();
					});
				}
			});
		};
	}
};