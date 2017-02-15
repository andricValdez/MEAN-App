

var app = angular.module("myApp",["ngRoute", 'ngSanitize']);




app.controller('mainController', function ($scope, $http) {

	//Atar this al vm (view-model)
	var vm = this;

	//Definir variables y objetos aquí
	vm.message = "¡Welcome to our page!";
	vm.email_CrearCuenta;
	vm.password_CrearCuenta;
	vm.type_CrearCuenta;
	vm.UserName_CrearCuenta
	vm.test;
	vm.email_IniciarSeSion;
	vm.password_IniciarSeSion;
	vm.type_IniciarSeSion;
	vm.token;

	vm.prueba;
	vm.myButton;
	vm.statusButton = false;
	vm.showCrearCuenta = true;
	vm.showIniciarSesion = true;

	// Funciones
	$scope.signUpLocal = function(){
		vm.type_CrearCuenta = 'signUpLocal'
		$http.post("/api/users", {'password':vm.password_CrearCuenta, 'username':vm.UserName_CrearCuenta, 'email':vm.email_CrearCuenta, 'type':vm.type_CrearCuenta}).then(function(response) {

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
			if (response.data.success == true) {
				vm.token = response.data.token;
	       		// vm.test = "Hola " + response.data.username + ". Este es tu token: " + response.data.token; 	
	       		vm.message = "Hola " + response.data.username + " \n¡Bienvenido!"
	       		console.log(response.data)	
	       		vm.showCrearCuenta = false;
				vm.showIniciarSesion = false;
	       		vm.statusButton = true;


			}
   		});
	};

	$scope.logOut = function(){
		$http.delete("/api/session", {params: {'token':vm.token}}).then(function(response) {
			console.log(response.data)		 
   		});
	};

	$scope.testB = function(){

		$http.get("/api/test", {params: {'token':vm.token}}).then(function(response) {
			console.log(response.data)		 
   		});
	};


});

app.directive("myDirective", function() {
    return {
        restrict : "EA",
        template : "<button type="+'button'+" class="+'btn btn-default'+" ng-click="+'getUsers()'+">Cerrar sesion</button>"
    };
});





app.controller('myHomeController', function($scope, $http){
	//Atar this al vm (view-model)
	var vm = this;

	vm.message = "hello";

})

