module.exports = function(req, res, next) {
		var max = _.max(req.user.permissions, function(pr) {
			return pr.level;
		});
		if (req.user.admin || max.level >= 2) {
			next();
		} else {
			return res.forbidden('You are not a global admin');
		}
};
