var jsonwebtoken = require('jsonwebtoken');
var Cookies = require('cookies');

module.exports = function(req, res, next){
	var cookies = new Cookies(req, res);
	var token = cookies.get('x-access-token');

	if (token) {
		jsonwebtoken.verify(token, 'superpupersecret', function(err, decoded) {
			if (err) {
				res.status(403).send({ success: false, message: "Failed to authenticate user"});
			} else {
				User.findOne({global_id: decoded.id, deletedBy: {$exists: false}}).exec(function(err, user) {
					req.user = user || {global_id: decoded.id, categories: [], admin: false, budget: 0};
					req.user.role = decoded.role;
					next();
				})
			}
		});
	} else {
		var current_url = req.protocol + '://' + 'team.binary-studio.com/accounting' //req.get('host')  + req.url;

		var cookies = new Cookies(req, res);
		cookies.set('referer', current_url);

		res.redirect('http://team.binary-studio.com/auth');
		// res.status(403).send({ success: false, message: "No Token Provided"});
	}
};