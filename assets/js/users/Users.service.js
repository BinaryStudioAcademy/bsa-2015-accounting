module.exports = function(app) {
  app.factory('UsersService', UsersService);

  UsersService.$inject = ["$resource"];

  function UsersService($resource) {
    return {
      getUsers: getUsers,
      getCurrentUser: getCurrentUser,
      createUser: createUser,
      editUser: editUser,
      deleteUser: deleteUser
    };

    function getRequest() {
      return $resource("/user/:id", { id: "@id" });
    }

    /**
     * Gets users array
     * @returns users array
     */
    function getUsers() {
      return getRequest().query();
    }

    function getCurrentUser() {
      var User = $resource("/user/current");
      return User.get();
    }

    /**
     * Creates new users
     * @param newUsers New users object
     * @returns created object
     */
    function createUser(newUsers) {
      return getRequest().save(newUsers);
    }

    /**
     * Updates user by id
     * @param userId User id
     * @param newUsers New user object
     * @returns edited object
     */
    function editUser(userId, newUsers) {
      var data = $resource("/user/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: userId }, newUsers);
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
