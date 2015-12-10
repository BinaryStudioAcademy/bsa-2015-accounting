module.exports = function(req, res, next) {
		var categories = req.user.categories || [];
		var max = _.max(categories, function(pr) {
			return pr.level;
		});
		if(req.param('id') && req.param('id') === req.user.id && !req.body.editPersonalBudget) {
			return res.forbidden('You cannot edit your own permissions');
		}
		if (req.user.role === "ADMIN" || req.user.admin || max.level >= 3) {
			next();
		} else {
			return res.forbidden('You are not a global admin');
		}
};
