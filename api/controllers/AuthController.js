var passport = require('passport');
var jsonwebtoken = require('jsonwebtoken');
var Cookies = require('cookies');

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.send({
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);
                return res.redirect('/');
            });

        })(req, res);
    },

    logout: function(req, res) {
        var current_url = req.protocol + '://' + req.get('host') + req.url;

        var cookies = new Cookies(req, res);
        cookies.set('referer', current_url);
        cookies.set('x-access-token');
        res.redirect('/');
    }
};
