/**
* Expense.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'mongo',
  attributes: {
    categoryId: {
      type: 'string'
    },
    date: {
      type: 'date'
    },
    creatorId: {
      type: 'string'
    },
    price: {
      type: 'float'
    },
    currency: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    subcategoryId: {
      type: 'string'
    }
  }
};

