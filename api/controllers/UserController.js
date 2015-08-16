/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  find: getUsers,
  update: updateUser,
  getCurrentUser: getCurrentUser
};

function getCurrentUser(req, res) {
  if(!req.isAuthenticated()) return res.forbidden();

  Currency.find().then(function(currencies) {
    var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(categories) {
      return categories;
    });
    return [expenses, currencies];
  }).spread(function(expenses, currencies) {
    req.user.budgets.forEach(function(budget) {
      var personalExpenses = _.filter(expenses, function(expense) {
        return (expense.creatorId == req.user.id && expense.categoryId == budget.id);
      });
      budget.used = 0;
      personalExpenses.forEach(function(expense) {
        if (expense.currency !== "UAH") {
          var expDate = new Date(expense.time * 1000);
          var rate = _.find(currencies, function(currency) {
            var currDate = new Date(currency.time * 1000);
            return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
          }).rate;
          budget.used += (expense.price * rate);
        }
        else {
          budget.used += expense.price;
        }
      });
    });
    return res.json(req.user);
  });
}

function getUsers(req, res) {
  User.find({deletedBy: {$exists: false}})
    .then(function(users) {
      var expenses = Expense.find({deletedBy: {$exists: false}, personal: true}).then(function(categories) {
        return categories;
      });
      var currencies = Currency.find().then(function(currencies) {
        return currencies;
      });
      return [users, expenses, currencies];
    }).spread(function(users, expenses, currencies) {
      users.forEach(function(user) {
        user.budgets.forEach(function(budget) {
          var personalExpenses = _.filter(expenses, function(expense) {
            return (expense.creatorId == user.id && expense.categoryId == budget.id);
          });
          budget.used = 0;
          personalExpenses.forEach(function(expense) {
            if (expense.currency !== "UAH") {
              var expDate = new Date(expense.time * 1000);
              var rate = _.find(currencies, function(currency) {
                var currDate = new Date(currency.time * 1000);
                return ((currDate.getFullYear() === expDate.getFullYear()) && (currDate.getMonth() === expDate.getMonth()) && (currDate.getDate() === expDate.getDate()));
              }).rate;
              budget.used += (expense.price * rate);
            }
            else {
              budget.used += expense.price;
            }
          });
        });
      });
      return res.send(users);
    }).fail(function(err) {
      return res.send(err);
    })
}

function updateUser(req, res) {
  var pk = actionUtil.requirePk(req);
  var values = actionUtil.parseValues(req);

  var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
  if (!idParamExplicitlyIncluded) delete values.id;

  User.findOne(pk).exec(function (err, user) {
    if (err) return res.serverError(err);
    if (!user) return res.notFound();

    if (values.setAdminStatus === true || values.setAdminStatus === false) {
      user.admin = values.setAdminStatus;
    }

    if (values.setPermissionLevel) {
      var cat = _.find(user.permissions, {id: values.setPermissionLevel.id});
      if (cat) {
        cat.level = values.setPermissionLevel.level;
      }
      else {
        user.permissions.push(values.setPermissionLevel);
      }
    }

    if (values.addPersonalBudget) {
      var bud = _.find(user.budgets, {id: values.addPersonalBudget.id});
      if (bud) {
        bud.budget += values.addPersonalBudget.budget;
      }
      else {
        user.budgets.push(values.addPersonalBudget);
      }
    }


    if (values.setName) {
      user.name = values.setName;
    }

    user.save(function (err) {
      if (err) return res.serverError(err);
    });
    res.ok(user);
  });
}
