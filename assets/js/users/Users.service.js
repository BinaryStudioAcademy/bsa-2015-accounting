module.exports = function(app) {
	app.factory('UsersService', UsersService);

	UsersService.$inject = ["$resource", "$q"];

	function UsersService($resource, $q) {
		return {
			getUsers: getUsers,
			//getGlobalUsers: getGlobalUsers,
			getCurrentUser: getCurrentUser,
			createUser: createUser,
			editUser: editUser,
			deleteUser: deleteUser
		};

		function getRequest() {
			return $resource("user/:id", { id: "@id" });
		}

		/**
		 * Gets users array
		 * @returns users array
		 */
		//function getUsers() {
		//	
//
//
//
//
//
//
		//		return $q(function(resolve, reject) {
		//			var globalUsersPromise = $resource("../profile/api/users/").query().$promise;
		//			var localUsersPromise = getRequest().query().$promise;
//
		//			$q.all([globalUsersPromise, localUsersPromise]).then(function(data) {
		//				var global_users = data[0] || [];
		//				var local_users = data[1] || [];
//
		//				global_users.forEach(function(user) {
		//					var local = _.find(local_users, {global_id: user.serverUserId});
		//					if (local) user.id = local.id;
		//					user.admin = local ? local.admin : false;
		//					user.budget = local ? local.budget : {used: 0, left: 0};
		//					user.categories = local ? local.categories : [];
		//				});
		//				resolve(global_users);
		//			});
		//		});
//
		//}
		function getUsers() {
			var globalUsersPromise = $resource("../profile/api/users/").query().$promise;
			var localUsersPromise = getRequest().query().$promise;

			return $q.all([globalUsersPromise, localUsersPromise]).then(function(data) {
				var global_users = data[0] || [];
				var local_users = data[1] || [];

				global_users.forEach(function(user) {
					var local = _.find(local_users, {global_id: user.serverUserId});
					if (local) user.id = local.id;
					user.admin = local ? local.admin : false;
					user.budget = local ? local.budget : {used: 0, left: 0};
					user.categories = local ? local.categories : [];
					user.local = local ? true : false;
				});
				console.log("hey, we r global_users", global_users);
				return global_users;
			});
		}

		//function getGlobalUsers() {
		//	return $resource("../profile/api/users/").query().$promise;
		//}

		function getCurrentUser() {
			var User = $resource("user/current");
			return User.get().$promise;
		}

		/**
		 * Creates new users
		 * @param newUsers New users object
		 * @returns created object
		 */
		function createUser(newUsers) {
			return getRequest().save(newUsers).$promise;
		}

		/**
		 * Updates user by id
		 * @param userId User id
		 * @param newUsers New user object
		 * @returns edited object
		 */
		function editUser(userId, newUsers) {
			var data = $resource("user/:id", { id: "@id" }, {
				update: {
					method: "PUT"
				}
			});
			return data.update({ id: userId }, newUsers).$promise;
		}

		/**
		 * Removes user by id
		 * @param userId User id
		 * @returns deleted object
		 */
		function deleteUser(userId) {
			return getRequest().remove({ id: userId });
		}
	}
};
