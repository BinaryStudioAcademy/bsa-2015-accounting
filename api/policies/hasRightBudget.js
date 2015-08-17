module.exports = function(req, res, next) {
	if (req.method === 'POST') {
		if (req.user.admin) {
			next();
		} else {
			return res.forbidden("You don't hane permission to do this");
		}
	} else {
		Budget.findOne({_id: req.param('id')}).exec(function(err, budget) {
			if (err) return res.serverError(err);
			if (!budget)  return res.notFound();

			var id = budget.category.id;
			var permissions = req.user.categories.filter(function(per) {
				return per.id === id &&  per.level >= 0;
			})[0];
			if (permissions) {
				switch (req.method) {
					case 'GET':
						var permission = permissions.level >= 1;
						break;
					case 'PUT':
						var permission = permissions.level >= 3;
						break;
				}
			}
			if (req.user.admin || permission) {
				next();
			} else {
				return res.forbidden("You don't hane permission to do this");
			}
		});
	}
};
