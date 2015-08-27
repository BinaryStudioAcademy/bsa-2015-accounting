var jsonwebtoken = require('jsonwebtoken');
var Cookies = require('cookies');
var _ = require('lodash');

module.exports = function(req, res, next){
	var cookies = new Cookies(req, res);
	var token = cookies.get('x-access-token');

	if (token) {
		jsonwebtoken.verify(token, 'superpupersecret', function(err, decoded) {
			if (err) {
				res.status(403).send({ success: false, message: "Failed to authenticate user"});
			} else {
				User.findOne({_id: decoded.id}).exec(function(err, user) {
					req.user = _.assign(decoded, user);
					next();
				})
			}
		});
	} else {
		var current_url = req.protocol + '://' + req.get('host') + req.url;

		var cookies = new Cookies(req, res);
		cookies.set('referer', current_url);

		res.redirect('http://localhost:2020/');
		// res.status(403).send({ success: false, message: "No Token Provided"});
	}
};
