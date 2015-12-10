module.exports = {
	dropAll: dropAll
};

function dropAll(req, res) {
	var result = {};

	Budget.destroy({}).exec(function deleteCB(err, data){
		result.budgets = data.length;
		Category.destroy({}).exec(function deleteCB(err, data){
			result.categories = data.length;
			//Currency.destroy({}).exec(function deleteCB(err, data){
				//result.currencies = data.length;
				Expense.destroy({}).exec(function deleteCB(err, data){
					result.expenses = data.length;
					History.destroy({}).exec(function deleteCB(err, data){
						result.history = data.length;
						User.destroy({}).exec(function deleteCB(err, data){
							result.users = data.length;
							res.ok(result);
						});
					});
				});
			//});
		});
	});
}