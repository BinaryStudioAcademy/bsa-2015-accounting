/**
* Budget.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		creatorId: {
			type: 'string',
			required: true
		},
		year: {
			type: 'integer',
			required: true
		},
		categoryId: {
			type: 'string',
			required: true
		},
		budget: {
			type: 'float',
			required: true
		},
		subcategories: {
			type: 'array',
			required: true
		}
	}
};

