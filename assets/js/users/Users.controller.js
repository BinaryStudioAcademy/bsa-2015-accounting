module.exports = function(app) {
	app.controller('UsersController', UsersController);

	UsersController.$inject = ['UsersService','filterFilter'];

	function UsersController(UsersService, filterFilter) {
		var vm = this;
//menu

	vm.menuTabs=true
	vm.toggleMenu = function(){
		vm.menuTabs =vm.menuTabs=== false ? true: false;
	}


		vm.currentUser = UsersService.getCurrentUser();

//table
		vm.students = [
			{Name: "Laura",Surname: "Sherm",Category: "HR", selected: false},
			{Name: "Bob",Surname: "Martin",Category: "Marketing", selected: false},
			{Name: "Alex",Surname: "Lion",Category: "Finance", selected: false},
			{Name: "Jon",Surname: "Smit",Category: "HR", selected: false},
			{Name: "Mike",Surname: "Norton",Category: "Marketing", selected: false},
			{Name: "Steew",Surname: "Mage",Category: "Finance", selected: false}
		];

		vm.save = function(){
			vm.students.push({
				Name: vm.newName,
				Surname: vm.newSurname,
				Category: vm.newCategory
			});

			vm.newName = vm.newSurname = vm.newCategory = '';
		};

		vm.remove = function(){
			vm.students = filterFilter(vm.students, function (student) {
				return !student.selected;
			});
		};

	}
};
