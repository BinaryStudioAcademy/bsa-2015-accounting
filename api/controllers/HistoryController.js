_ = require('lodash');

module.exports = {
	find: find
};

function find(req, res) {
	var filter = req.query.type ? {type: req.query.type} : {};
	console.log('filter', filter);
	History.find(filter).then(function(events) {
		console.log('events', events);
		var users = User.find().then(function(users) {
			return users;
		});
		console.log('users', users);
		var expenses = Expense.find().then(function(expenses) {
			return expenses;
		});
		console.log('expenses', expenses);
		var budgets = Budget.find().then(function(budgets) {
			return budgets;
		});
		console.log('budgets', budgets);
		var categories = Category.find().then(function(categories) {
			return categories;
		});
		console.log('categories', categories);
		return [events, users, expenses, budgets, categories];
	}).spread(function(events, users, expenses, budgets, categories) {
		events.forEach(function(event) {
			var user = _.find(users, {id: event.who});
			console.log('user#', user);
			var time = event.time * 1000;
			console.log('time#', time);
			var target = 'no name';
			console.log('target', target);
			switch (event.type) {
				case 'expense':
					target = _.find(expenses, {id: event.target}).name;
					break;
				case 'budget':
					var budget = _.find(budgets, {id: event.target});
					target = _.find(categories, {id: budget.category.id}).name + ' ' + budget.year;
					break;
				case 'user':
					u = _.find(users, {id: event.target})
					target = u ? u.name : 'anonymous';
					break;
			}

			event.who = user.name;
			event.target = target;
			event.time = time;
			console.log('events#', event);
		});
		console.log('events', events);
		res.send(events);
	}).fail(function(err) {
		return res.send(err);
	});
}