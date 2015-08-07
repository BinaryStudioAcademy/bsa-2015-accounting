var bcrypt = require('bcryptjs');

module.exports = {

	identity: 'user',

	attributes: {
		login: {
			type: 'email',
			required: true,
			unique: true
		},
		password: {
			type: 'string',
			minLength: 6,
			required: true
		},
		name: {
			type: 'string',
			defaultsTo: 'anonymous'
		},
		role: {
			type: 'string',
			defaultsTo: 'manager'
		},
		toJSON: function() {
			var obj = this.toObject();
			delete obj.password;
			return obj;
		}
	},
	beforeCreate: function(user, cb) {
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) {
					console.log(err);
					cb(err);
				} else {
					user.password = hash;
					cb();
				}
			});
		});
	}
};