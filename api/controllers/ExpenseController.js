/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil'),
		_ = require('lodash');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
	find: getExpenses,
	create: createExpense,
  findDeleted: findDeleted,
  restoreDeleted: restoreDeleted
};

function getExpenses(req, res) {
	var year = req.param('year');
	var isPersonal = req.param('personal');
	var permissions = _.pluck(_.filter(req.user.categories, function(per) {
		return per.level >= 1;
	}), 'id');
	var filter = {deletedBy: {$exists: false}}
	var expenseFilter = req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}});
	if (year) {
		var start = Date.parse('01/01/' + year + ' 00:00:00') / 1000;
		var end = Date.parse('12/31/' + year + ' 23:59:59') / 1000;
		filter = {deletedBy: {$exists: false}, time: {$gte: start, $lte: end }};
	}
  if (isPersonal) filter.creatorId = req.session.passport.user;
	Expense.find(expenseFilter)
	.where(actionUtil.parseCriteria(req))
	.sort(actionUtil.parseSort(req))
	.then(function(expenses) {
		var users = User.find().then(function(users) {
			return users;
		});
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		return [expenses, users, categories];
	}).spread(function(expenses, users, categories) {
		expenses.forEach(function(expense) {
			var category = _.find(categories, {id: expense.categoryId});
			expense.category = {
				id: expense.categoryId,
				name: category.name
			};
			expense.subcategory = {
				id: expense.subcategoryId,
				name: _.find(category.subcategories, {id: expense.subcategoryId}).name
			};
			delete expense.categoryId;
			delete expense.subcategoryId;
			var user = _.find(users, {id: expense.creatorId}) || {id: "unknown id", name: "unknown name"};
			expense.creator = {
				id: user.id,
				name: user.name
			};
			delete expense.creatorId;
		});
		return res.send(expenses);
	}).fail(function(err) {
		return res.send(err);
	});
}

function createExpense(req, res) {
	var data = actionUtil.parseValues(req);
	data.creatorId = req.session.passport.user || "unknown id";
	Expense.create(data).exec(function created (err, newInstance) {
		if (err) return res.negotiate(err);
		var log = {who: req.user.id, action: 'created', type: 'expense', target: newInstance.id, time: Number((new Date().getTime() / 1000).toFixed())};
		History.create(log).exec(function(err, log) {
			if (err) return res.negotiate(err);

			res.created(newInstance);
		});
	});
}

function findDeleted(req, res) {
  var permissions = _.pluck(_.filter(req.user.categories, function(per) {
    return per.level == 3;
  }), 'id');
  var filter = {deletedBy: {$exists: true}};
  var expenseFilter = req.user.admin ? filter : _.assign(filter, {'categoryId': {$in: permissions}});

  Expense.find(expenseFilter)
    .where(actionUtil.parseCriteria(req))
    .sort(actionUtil.parseSort(req))
    .then(function(expenses) {
      var users = User.find().then(function(users) {
        return users;
      });
      var categories = Category.find().then(function(categories) {
        return categories;
      });
      return [expenses, users, categories];
    }).spread(function(expenses, users, categories) {
      expenses.forEach(function(expense) {
        var category = _.find(categories, {id: expense.categoryId});
        expense.category = {
          id: expense.categoryId,
          name: category.name
        };
        expense.subcategory = {
          id: expense.subcategoryId,
          name: _.find(category.subcategories, {id: expense.subcategoryId}).name
        };
        delete expense.categoryId;
        delete expense.subcategoryId;
        var user = _.find(users, {id: expense.creatorId}) || {id: "unknown id", name: "unknown name"};
        expense.creator = {
          id: user.id,
          name: user.name
        };
        delete expense.creatorId;
        var deletedByUser = _.find(users, {id: expense.deletedBy}) || {id: "unknown id", name: "unknown name"};
        delete expense.deletedBy;
        expense.deletedBy = {
          id: deletedByUser.id,
          name: deletedByUser.name
        };
      });
      return res.send(expenses);
    }).fail(function(err) {
      return res.send(err);
    });
}

function restoreDeleted(req, res) {
  var pk = actionUtil.requirePk(req);

  Expense.native(function(err, collection) {
    if(err) return res.serverError(err);

    collection.update({
        _id: { $in: [pk, new ObjectId(pk)] }
      },
      {
        $unset: {deletedBy: true}
      },
      function (err, results) {
        if (err) return res.serverError(err);
        return res.ok(results);
      });
  });
}
