module.exports = function(req, res, next) {
		if (req.user.role === "ADMIN" || req.user.admin) {
			next();
		} else {
			return res.forbidden('You are not a global admin');
		}
};
