module.exports = function(req, res, next) {
	Expense.findOne({_id: req.param('id')}).exec(function(err, expense) {
		if (err) return res.serverError(err);
		if (!expense)  return res.notFound();

		var id = expense.categoryId;
		var permissions = req.user.permissions[id];
		if (permissions) {
			var permission = permissions.admin;
		}

		var creator = expense.creatorId === req.user.id;

		if (req.user.role === 'global admin' || permission || creator) {
			next();
		} else {
			return res.forbidden("You don't have permission to do this");
		}
	});
};