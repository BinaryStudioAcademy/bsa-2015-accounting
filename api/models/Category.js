/**
* Category.js
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
    name: {
      type: 'string'
    },
    subcategories: {
      type: 'array'
    },
    rights: {
      type: 'array'
    }
  }
};

