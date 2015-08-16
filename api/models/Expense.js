/**
* Expense.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		categoryId: {
			type: 'string',
			required: true
		},
		subcategoryId: {
			type: 'string',
			required: true
		},
		time: {
			type: 'integer',
			required: true
		},
		creatorId: {
			type: 'string',
      required: true
		},
		price: {
			type: 'float',
			required: true
		},
		currency: {
			type: 'string',
			required: true
		},
    personal: {
      type: 'boolean'
    },
		name: {
			type: 'string',
			required: true
		},
		description: {
			type: 'string'
		},
		personal: {
			type: 'boolean',
			defaultsTo: false
		}
	}
};


//module.exports = {
//	attributes: {
//		categoryId: {
//			type: 'string',
//			required: true
//		},
//		time: {
//			type: 'datetime',
//			required: true
//		},
//		creatorId: {
//			type: 'string',
//			required: true
//		},
//		price: {
//			type: 'float',
//			required: true
//		},
//		currency: {
//			type: 'string',
//			required: true
//		},
//		name: {
//			type: 'string',
//			required: true
//		},
//		description: {
//			type: 'string',
//			required: false
//		},
//		subcategoryId: {
//			type: 'string',
//			required: true
//		}
//	}
//};


