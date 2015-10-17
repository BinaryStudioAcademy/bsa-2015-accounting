module.exports = function(app) {
	app.factory('UsersService', UsersService);

	UsersService.$inject = ["$resource", "$q"];

	function UsersService($resource, $q) {
		return {
			getUsers: getUsers,
			getCurrentUser: getCurrentUser,
			createUser: createUser,
			editUser: editUser
		};

		function getRequest() {
			return $resource("user/:id", { id: "@id" });
		}

		function getUsers() {
			var globalUsersPromise = $resource("../profile/api/users/").query().$promise;
			var localUsersPromise = getRequest().query().$promise;

			return $q.all([globalUsersPromise, localUsersPromise]).then(function(data) {
				var global_users = data[0] || [];
				var local_users = data[1] || [];

				global_users.forEach(function(user) {
					var local = _.find(local_users, {global_id: user.serverUserId});
					user.id = local ? local.id : false;
					user.admin = local ? local.admin : false;
					user.budget = local ? local.budget : {used: 0, left: 0};
					user.categories = local ? local.categories : [];
					user.name = user.name + " " + user.surname;
					delete user.surname;
				});
				return global_users;
			});
		}

		function getCurrentUser() {
			return $q(function(resolve, reject) {
				$resource("user/current").get().$promise.then(function(local_user) {
					$resource("../profile/api/users?serverUserId=" + local_user.global_id).query().$promise.then(function(global_user) {
						local_user.name = global_user[0].name + " " + global_user[0].surname;
						resolve(local_user);
					});
				});
			});
		}

		function createUser(userData) {
			return getRequest().save(userData).$promise;
		}

		function editUser(userId, userData) {
			var data = $resource("user/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: userId }, userData).$promise;
		}
	}
};
