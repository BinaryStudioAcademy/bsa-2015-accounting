var bcrypt = require('bcryptjs');

module.exports = {
	attributes: {
		global_id: {
			type: 'string',
			required: true
		},
		categories: {
			type: 'array',
			defaultsTo: []
		},
		admin: {
			type: 'boolean',
			defaultsTo: false
		},
		budget: {
			type: 'float',
			defaultsTo: 0
		}
		// toJSON: function() {
		// 	var obj = this.toObject();
		// 	delete obj.password;
		// 	return obj;
		// }
	},
	// beforeCreate: function(user, cb) {
	// 	bcrypt.genSalt(10, function(err, salt) {
	// 		bcrypt.hash(user.password, salt, function(err, hash) {
	// 			if (err) {
	// 				console.log(err);
	// 				cb(err);
	// 			} else {
	// 				user.password = hash;
	// 				cb();
	// 			}
	// 		});
	// 	});
	// }
};
