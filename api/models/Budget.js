/**
* Budget.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		creatorId: {
			model: 'user'
		},
		year: {
			type: 'integer',
			required: true
		},
		categoryId: {
			model: 'category'
		},
		budget: {
			type: 'float',
			required: true
		},
		subcategories: {
			type: 'array',
			defaultsTo: []
		}
	}
};

