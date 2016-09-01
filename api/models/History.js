module.exports = {

	attributes: {
		who: {
			type: 'string',
			required: true
		},
		action: {
			type: 'string',
			required: true
		},
		type: {
			type: 'string',
			required: true
		},
		target: {
			type: 'string',
			required: true
		},
		time: {
			type: 'integer',
			required: true
		},
		income: {
			type: 'json',
			required: false
		}
	}
};

