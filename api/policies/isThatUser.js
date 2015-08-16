module.exports = function(req, res, next) {
	if (req.user.role === 'global admin' || req.user.id == req.param('id')) {
		next();
	} else {
		return res.forbidden('You are not an owner');
	}
};
