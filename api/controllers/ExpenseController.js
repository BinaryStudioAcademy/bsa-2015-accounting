/**
 * ExpenseController
 *
 * @description :: Server-side logic for managing expenses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	find: getExpenses
};

function getExpenses(req, res) {
	Expense.find({deletedBy: {$exists: false}}).populateAll().exec(function(err, expenses) {
		return res.send(expenses);
	});
}

//	---faster but more uglier---
//function getExpenses(req, res) {
//	Expense.find({deletedBy: {$exists: false}})
//	.then(function(expenses){
//			var users = User.find().then(function(users){
//					return users;
//			});
//			var categories = Category.find().then(function(categories){
//					return categories;
//			});
//			return [expenses, users, categories];
//	}).spread(function(expenses, users, categories){
//		for (var e in expenses) {
//			for (var u in users) {
//				if (users[u].id == expenses[e].creatorId) {
//					expenses[e].creator = users[u].name;
//					//delete expenses[e].creatorId;
//					break;
//				}
//			}
//			for (var c in categories) {
//				if (categories[c].id == expenses[e].categoryId) {
//					expenses[e].category = categories[c].name;
//					for (var s in categories[c].subcategories) {
//						if (categories[c].subcategories[s]._id == expenses[e].subcategoryId) {
//							expenses[e].subcategory = categories[c].subcategories[s].name;
//							//delete expenses[e].subcategoryId;
//							break;
//						}
//					}
//					//delete expenses[e].categoryId;
//					break;
//				}
//			}
//		}
//		return res.send(expenses);
//	}).fail(function(err){
//		return res.send(err);
//	}) 
//}