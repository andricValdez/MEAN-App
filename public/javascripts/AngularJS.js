

var app = angular.module("myApp",[]);


app.controller('mainController', function ($scope, $http) {

	//Atar this al vm (view-model)
	var vm = this;

	//Definir variables y objetos aquí
	vm.message = "¡Welcome to our page :)!";
	vm.email;
	vm.password;
	vm.type;
	vm.test;

	// Funciones
	$scope.signUpLocal = function(){
		vm.type = 'signUpLocal'
		$http.post("/api/users", {'password':vm.password, 'email':vm.email, 'type':vm.type}).then(function(response) {

       		console.log(response.data);
    		 
   		});
	};

	$scope.checkLoginState = function(){
  		FB.login(function(response){
  			vm.type = 'signUpFB'
  			if (response.status == "connected") {
  				$http.post("/api/usersFB", {'oauth_Token':response.authResponse.accessToken, 'type':vm.type}).then(function(response) {
    				console.log(response.data);
   				});
  			}
		});
	};


	$scope.getUsers = function(){
		$http.get("/api/users").then(function(response){
			vm.test = response.data;
		});
	};



});

