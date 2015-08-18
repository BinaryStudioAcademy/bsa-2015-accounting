module.exports = function(req, res, next) {
		var max = _.max(req.user.categories, function(pr) {
			return pr.level;
		});
		if (req.user.admin || max.level >= 3) {
			next();
		} else {
			return res.forbidden('You are not a global admin');
		}
};
