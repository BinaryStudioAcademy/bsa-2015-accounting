module.exports = function(app) {
  app.factory('CategoriesService', CategoriesService);

  CategoriesService.$inject = ["$resource"];

  function CategoriesService($resource) {
    return {
      getCategories: getCategories,
      getCategory: getCategory,
      createCategory: createCategory,
      editCategory: editCategory,
      deleteCategory: deleteCategory
    };

    function getRequest() {
      return $resource("/category/:id", { id: "@id" });
    }

    /**
     * Gets categories array
     * @returns categories array
     */
    function getCategories() {
      return getRequest().query().$promise;
    }

    /**
     * Gets category by id
     * @returns category object
     */
    function getCategory(categoryId) {
      return getRequest().get({ id: categoryId }).$promise;
    }

    /**
     * Creates new category
     * @param newCategory New category object
     * @returns created object
     */
    function createCategory(newCategory) {
      return getRequest().save(newCategory).$promise;
    }

    /**
     * Updates category by id
     * @param categoryId Category id
     * @param newCategory New category object
     * @returns edited object
     */
    function editCategory(categoryId, newCategory) {
      var data = $resource("/category/:id", { id: "@id" }, {
        update: {
          method: "PUT"
        }
      });
      return data.update({ id: categoryId }, newCategory).$promise;
    }

    /**
     * Removes category by id
     * @param categoryId Category id
     * @returns deleted object
     */
    function deleteCategory(categoryId) {
      return getRequest().remove({ id: categoryId });
    }
  }
};
