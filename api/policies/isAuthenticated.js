module.exports = function(req, res, next) {
	console.log('2');
	if (req.user) {
		return next();
	} else {
		return res.redirect('http://localhost:2020/login');
	}
};