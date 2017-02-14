

var app = angular.module("myApp",["ngRoute"]);


app.controller('mainController', function ($scope, $http) {

	//Atar this al vm (view-model)
	var vm = this;

	//Definir variables y objetos aquí
	vm.message = "¡Welcome to our page!";
	vm.email_CrearCuenta;
	vm.password_CrearCuenta;
	vm.type_CrearCuenta;
	vm.test;
	vm.email_IniciarSeSion;
	vm.password_IniciarSeSion;
	vm.type_IniciarSeSion;
	vm.token;

	// Funciones
	$scope.signUpLocal = function(){
		vm.type_CrearCuenta = 'signUpLocal'
		$http.post("/api/users", {'password':vm.password_CrearCuenta, 'email':vm.email_CrearCuenta, 'type':vm.type_CrearCuenta}).then(function(response) {

       		console.log(response.data);
    		 
   		});
	};

	$scope.checkLoginState = function(){
  		FB.login(function(response){
  			vm.type_CrearCuenta = 'signUpFB'
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

	$scope.logInLocal = function(){
		vm.type_IniciarSeSion = 'logInLocal';
		$http.post("/api/session", {'password':vm.password_IniciarSeSion, 'email':vm.email_IniciarSeSion, 'type':vm.type_IniciarSeSion}).then(function(response) {
			vm.token = response.data.token;
       		vm.test = "Hola " + response.data.email + ". Este es tu token: " + response.data.token; 		 
   		});
	};


	$scope.testB = function(){
		$http.post("/api/authenticate_token", {'token':vm.token}).then(function(response) {
			console.log(response)		 
   		});
	};


});


app.controller('myHomeController', function($scope, $http){
	//Atar this al vm (view-model)
	var vm = this;

	vm.message = "hello";

})

