module.exports = function(req, res, next) {
	Budget.findOne({_id: req.param('id')}).exec(function(err, budget) {
		if (err) return res.serverError(err);
		if (!budget)  return res.notFound();

		var id = budget.category.id;
		var permissions = req.user.permissions.filter(function(per) {
			return per.id === id;
		})[0];
		if (permissions) {
			switch (req.method) {
				case 'GET':
					var permission = permissions.read;
					break;
				case 'PUT':
					var permission = permissions.admin;
					break;
				case 'POST':
					var permission = false;
					break;
			}
		}

		if (req.user.role === 'global admin' || permission) {
			next();
		} else {
			return res.forbidden("You don't hane permission to do this");
		}
	});
};
