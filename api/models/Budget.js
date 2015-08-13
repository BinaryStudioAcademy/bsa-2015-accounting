/**
* Budget.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		creatorId: {
			type: 'string'
		},
		year: {
			type: 'integer',
			required: true
		},
		category: {
			type: 'json',
			required: true
		},
		//subcategories: [{
		//	id: {
		//		type: 'string',
		//		unique: true
		//	},
		//	budget: {
		//		type: 'float'
		//	}
		//}]
		subcategories: {
			type: 'array',
			defaultsTo: []
		}
	}
};