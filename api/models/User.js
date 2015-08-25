var bcrypt = require('bcryptjs');

module.exports = {
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
		admin: {
			type: 'boolean',
			defaultsTo: false
		},
		// permissions: {
		// 	type: 'array',
		// 	defaultsTo: []
		// },
		categories: {
			type: 'array',
			defaultsTo: []
		},
    budget: {
      type: 'float',
      defaultsTo: 0
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
