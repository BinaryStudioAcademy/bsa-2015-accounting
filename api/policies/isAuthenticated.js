module.exports = function(req, res, next) {
	console.log(req.user);
  if (req.user) {
		return next();
	} else {
		return res.redirect('http://team.binary-studio.com/auth');
	}
};
