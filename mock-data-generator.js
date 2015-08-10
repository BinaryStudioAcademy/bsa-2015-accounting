console.log('*** Destroying your hard drive... \n*** It could take some time...');

var fs = require('fs');
var casual = require('casual');
var Factory = require('rosie').Factory;
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var MongoClient = require('mongodb').MongoClient;

var db = {};
var subcategories = [];

db.category = [];
db.budget = [];
db.expense = [];
db.user = [];
db.currency = [];

Factory.define('Subcategory')
	.sequence('id', function() {return String(casual.integer(0, 10000000));});

Factory.define('Category')
	.sequence('_id', function() {return String(casual.integer(0, 10000000));})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});


Factory.define('Budget')
	.sequence('_id', function() {return String(casual.integer(0, 10000000));})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});

Factory.define('Expense')
	.sequence('_id', function() {return String(casual.integer(0, 10000000));})
	.attr('time', function() {return casual.integer(946677600, 1167602399);})
	.attr('price', function() {return casual.integer(3000, 10000);})
	.attr('currency', function() {return casual.random_element(['USD', 'UAH']);})
	.attr('description', function() {return casual.description;})
	.attr('name', function() {return casual.title;});

Factory.define('Currency')
	.sequence('_id', function() {return String(casual.integer(0, 10000000));})
	.sequence('time', function() {return casual.unix_time })
	.attr('rate', function() {return Number((Math.random() * (25 - 16) + 16).toFixed(2))})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});

Factory.define('User')
	.sequence('_id', function() {return String(casual.integer(0, 100000));})
	.sequence('login', function() {return casual.email})
	.attr('name', function() {return casual.name})
	.attr('role', function() {return casual.random_element(['manager', 'admin']);})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});

_.times(40, function() {
	var curr = Factory.build('Currency');
	db.currency.push(curr);
});

_.times(50, function() {
	var salt = bcrypt.genSaltSync(10, function(err, salt) {return salt});
	var hash = bcrypt.hashSync('111111', salt, function(err, hash) {return hash});
	var user = Factory.build('User', {password: hash});
	db.user.push(user);
});

_.times(1000, function() {
	var sub = Factory.build('Subcategory');
	subcategories.push(sub);
});

_.times(5, function(n) {
	var subs = subcategories.splice(0, 8);
	var managers = _.sample(db.user, 20).map(function(usr) {
		return usr._id;
	});
	var names = ['HR', 'Marketing', 'Finance', 'Technical', 'Accounting'];
	subs.map(function(s, i) {
		return s.name = names[n] + '-sub-' + i;
	});
	var category = Factory.build('Category', {name: names[n], subcategories: subs, managers: managers});
	db.category.push(category);

	_.times(7, function(n) {
		var total = 0;
		var sample_subs = _.sample(subs, casual.integer(3, 6));
		var sub_with_money = sample_subs.map(function(sub) {
			var money = casual.integer(1000, 50000);
			total += money;
			return {id: sub.id, budget: money};
		});
		var budget_money = Math.round((total * casual.random_element([1, Number((Math.random() * (1.15 - 1) + 1).toFixed(2))])) / 1000 ) * 1000;
		var budget = Factory.build('Budget', {budget: budget_money, year: 2000 + n, categoryId: category._id, subcategories: sub_with_money, creatorId: _.sample(managers, 1)[0]});
		db.budget.push(budget);
	});
});

_.times(20, function() {
	db.category.forEach(function(category) {
		category.subcategories.forEach(function(sub) {
			var expense = Factory.build('Expense', {creatorId: String(_.sample(db.user, 1)[0]._id), categoryId: category._id, subcategoryId: sub.id});
			db.expense.push(expense);
		});
	});
});

// _.times(1000, function() {
// 	var category = _.sample(db.category, 1)[0];
// 	var subcategory = _.sample(category.subcategories, 1)[0];
// 	var expense = Factory.build('Expense', {creatorId: String(_.sample(db.user, 1)[0]._id), categoryId: category._id, subcategoryId: subcategory.id});
// 	db.expense.push(expense);
// });

var url = 'mongodb://localhost:27017/portal-accounting';

_.forEach(db, function(obj, name) {
	MongoClient.connect(url, function(err, database) {
		if (err) throw err;

		database.collection(name).remove({});
		database.collection(name).insert(obj);
		database.close();
	});
});

console.log('Done!');