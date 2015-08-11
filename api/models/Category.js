/**
* Category.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	identity: 'category',

	attributes: {
		name: {
			type: 'string',
			required: true
		},
		//subcategories: [{
		//	id: {
		//		type: 'string',
		//		unique: true
		//	},
		//	name: {
		//		type: 'string'
		//	}
		//}],
		subcategories: {
			type: 'array',
			defaultsTo: []
		},
		managers: {
			type: 'array',
			defaultsTo: []
		}
	}
};

