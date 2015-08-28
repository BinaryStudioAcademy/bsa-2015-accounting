module.exports = function(req, res, next) {
	if (req.user) {
		return next();
	} else {
		return res.redirect('/auth');
	}
};
