module.exports = function(req, res, next) {
	if (req.method === 'POST') {
		Category.findOne({_id: req.body.categoryId}).exec(function(err, category) {
			if (err) return res.serverError(err);
			if (!category)  return res.notFound();

			var id = req.body.categoryId;
			var permissions = req.user.permissions.filter(function(per) {
				return per.id === id;
			})[0];
			if (permissions) {
				var permission = permissions.level >= 2;
			}
			if (req.user.admin || permission) {
				next();
			} else {
				return res.forbidden("You don't have permission to do this");
			}
		});
	} else {
		Expense.findOne({_id: req.param('id')}).exec(function(err, expense) {
			if (err) return res.serverError(err);
			if (!expense)  return res.notFound();

			var id = expense.categoryId;
			var permissions = req.user.permissions.filter(function(per) {
				return per.id === id;
			})[0];
			if (permissions) {
				var permission = permissions >= 2;
			}

			var creator = expense.creatorId === req.user.id;

			if (req.user.admin || permission || creator) {
				next();
			} else {
				return res.forbidden("You don't have permission to do this");
			}
		});
	}
};