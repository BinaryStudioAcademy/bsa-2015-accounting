console.log('*** Destroying your hard drive... \n*** It could take some time...');

var fs = require('fs');
var casual = require('casual');
var Factory = require('rosie').Factory;
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var MongoClient = require('mongodb').MongoClient;

var startYear = 2009;
var years = 7;
var categories = ['HR', 'Marketing', 'Finance', 'Technical', 'Accounting'];
var events = ['Conference', 'Party', 'Businnes trip', 'Camping', 'Media event', 'Travel', 'Holiday', 'Sport event'];
var charges = ['water', 'drinks', 'chips', 'pastery', 'fruits', 'vegetables', 'cheese', 'popcorn', 'transport', 'ice cream', 'smoothie', 'cakes', 'ballones', 'hats', 
'costumes', 'capes', 'bowler', 'snacks', 'cookies', 'ham', 'tickets'];

var salt = bcrypt.genSaltSync(10, function(err, salt) {return salt});
var hash = bcrypt.hashSync('111111', salt, function(err, hash) {return hash});

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
	.attr('price', function() {return casual.integer(3000, 10000);})
	.attr('currency', function() {return casual.random_element(['USD', 'UAH']);})
	.attr('description', function() {return casual.description;})
	.attr('personal', function() {return false;})
	.attr('name', function() {return casual.random_element(events) + ' #' + casual.integer(1, 9) + ': ' + casual.random_element(charges);});

Factory.define('Currency')
	.sequence('_id', function() {return String(casual.integer(0, 10000000));})
	.attr('rate', function() {return Number((Math.random() * (25 - 16) + 16).toFixed(2))})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});

Factory.define('User')
	.sequence('_id', function() {return String(casual.integer(0, 100000));})
	.sequence('login', function() {return casual.email})
	.attr('name', function() {return casual.name})
	.attr('createdAt', function() {return new Date().toISOString();})
	.attr('updatedAt', function() {return new Date().toISOString();});

_.times(1000, function() {
	var sub = Factory.build('Subcategory');
	subcategories.push(sub);
});

_.times(categories.length, function(n) {
	var subs = subcategories.splice(0, 8);
	var managers = _.sample(db.user, 20).map(function(usr) {
		return usr._id;
	});
	var names = categories;
	subs.map(function(s, i) {
		return s.name = names[n] + '-sub-' + i;
	});
	var category = Factory.build('Category', {name: names[n], subcategories: subs});
	var categoryId = category._id;
	var user = Factory.build('User', {password: hash, role: 'user', budgets: [{id: categoryId, budget: casual.integer(3, 7) * 100}], permissions: {}});
	user.permissions[categoryId] = {read: true, post: true, admin: true};
	db.user.push(user);
	db.category.push(category);

	_.times(years, function(n) {
		var total = 0;
		var sample_subs = _.sample(subs, casual.integer(3, 6));
		var sub_with_money = sample_subs.map(function(sub) {
			var money = casual.integer(1, 50) * 1000;
			total += money;
			return {id: sub.id, budget: money};
		});
		var budget_money = Math.round((total * casual.random_element([1, Number((Math.random() * (1.15 - 1) + 1).toFixed(2))])) / 1000 ) * 1000;
		var budget = Factory.build('Budget', {year: startYear + n, category: {id: category._id, budget: budget_money}, subcategories: sub_with_money, creatorId: _.sample(managers, 1)[0]});
		db.budget.push(budget);
	});
});

_.times(years, function(n) {
	var year = startYear + n;
	_.times(6, function(nn) {
		db.category.forEach(function(category) {
			category.subcategories.forEach(function(sub) {
				var date = casual.date(format = 'MM/DD') + '/' + year;
				var dateTime = date + ' ' + casual.time(format = 'HH:mm:ss');
				var curTime = Date.parse(date) / 1000;
				var expTime = Date.parse(dateTime) / 1000;
				var index = _.findIndex(db.currency, function(x) {
					return x.time === curTime;
				});
				if (index === -1) {
					var currency = Factory.build('Currency', {time: curTime});
					db.currency.push(currency);
				}
				if (nn === 4) {
					var expense = Factory.build('Expense', {deletedBy: _.sample(db.user, 1)[0]._id, time: expTime, creatorId: String(_.sample(db.user, 1)[0]._id), categoryId: category._id, subcategoryId: sub.id});
					db.expense.push(expense);
				} else if (nn === 5) {
					var expense = Factory.build('Expense', {time: expTime, creatorId: String(_.sample(db.user, 1)[0]._id), categoryId: category._id, subcategoryId: sub.id});
					expense.personal = true;
					db.expense.push(expense);
				}
				else {
					var expense = Factory.build('Expense', {time: expTime, creatorId: String(_.sample(db.user, 1)[0]._id), categoryId: category._id, subcategoryId: sub.id});
					if (expense.currency === 'UAH') {
						expense.price *= 20;
					}
					db.expense.push(expense);
				}
			});
		});
	});
});

var owner = {_id: 'a', login: 'admin@admin', role: 'global admin', permissions: {}, budgets: [], 'createdAt': new Date().toISOString(), 'updatedAt': new Date().toISOString(), password: hash};
db.user.push(owner);

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
