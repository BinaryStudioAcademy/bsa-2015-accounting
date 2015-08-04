/**
* Budget.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  connection: 'mongo',
  attributes: {
    _id: {
      type: 'string',
      primaryKey: true,
      required: true
    },
    creatorId: {
      type: 'string'
    },
    year: {
      type: 'integer'
    },
    categoryId: {
      type: 'string'
    },
    budget: {
      type: 'float'
    },
    subcategories: {
      type: 'array'
    }
  }
};

