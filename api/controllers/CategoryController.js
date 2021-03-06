var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var _ = require('lodash');

module.exports = {
	update: updateCategory,
	find: find
};

function find(req, res) {
	var queryParams = actionUtil.parseCriteria(req);
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');
	var filter = req.user.role === 'ADMIN' || req.user.admin ? {} : {id: {$in: permissions}};
	Category.find(filter).exec(function(err, categories) {
		if (err) return res.serverError(err);

		if (queryParams.active) {
			var budgetFilter = {deletedBy: {$exists: false}};
			Budget.find(budgetFilter).exec(function(err, budgets) {
				if (err) return res.serverError(err);

				res.ok(_.filter(categories, function(category) {
					return _.find(budgets, function(budget) {
						return budget.category.id === category.id;
					});
				}));
			});
		}
		else {
			res.ok(categories);
		}
	});
}



function updateCategory(req, res) {
	var pk = actionUtil.requirePk(req);
	var values = actionUtil.parseValues(req);

	var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
	if (!idParamExplicitlyIncluded) delete values.id;

	Category.findOne(pk).exec(function (err, category) {
		if (err) return res.serverError(err);
		if (!category) return res.notFound();

		if (values.setName) {
			category.name = values.setName.name;
		}

		if (values.setSubName) {
			_.find(category.subcategories, {id: values.setSubName.id}).name = values.setSubName.name;
		}

		if (values.addSubcategory) {
			category.subcategories.push(values.addSubcategory);
		}

		category.save(function (err) {
			if (err) return res.serverError(err);
		});
		res.ok(category);
	});
}