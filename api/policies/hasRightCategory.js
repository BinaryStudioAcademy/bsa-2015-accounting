module.exports = function(req, res, next) {
	var id = req.param('id');
	var categories = req.user.categories || [];
	var permissions = categories.filter(function(per) {
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
			case 'POST':
				var permission = false;
				break;
		}
	}

	if (req.user.role === "ADMIN" || req.user.admin || permission) {
		next();
	} else {
		return res.forbidden("You don't hane permission to do this");
	}
};