  

var app = angular.module("myApp",["ngRoute", 'ngSanitize']);


  

app.controller('mainController', function ($scope, $http) {


	//Atar this al vm (view-model)
	var vm = this;

	//Definir variables y objetos aquí
	vm.message = "¡Welcome to Pitaya Soft!";
	vm.email_CrearCuenta;
	vm.password_CrearCuenta;
	vm.type_CrearCuenta;
	vm.UserName_CrearCuenta
	vm.email_IniciarSeSion;
	vm.password_IniciarSeSion;
	vm.type_IniciarSeSion;
	vm.token = '';
	vm.notEvalToken = true;
	vm.picture;

	vm.test;
	vm.Users;
	vm.Sessions;

	vm.prueba = null;
	vm.myButton;
	vm.cerrarSesionB = false;
	vm.showCrearCuenta = true;
	vm.showIniciarSesion = true;

	

	// console.log(localStorage.token)
	if (localStorage.token  != '') {
		//Enviar token y validar en server para saber si el usuario aún tiene sesión abierta
		//¿Es bueno poner still_LogIn?

		$http.post("/api/still_LogIn", {'token':localStorage.token, 'isSignedIn':localStorage.isSignedIn}).then(function(response) {
			console.log(response.data)	
			if (response.data.type == 'logInGoogle' && response.data.success == true) {

			}else if (response.data.success == true) {
				$scope.validToken(response);
			}	 
  		});
	}

	// Funciones
	$scope.signUpLocal = function(){
		vm.notEvalToken = false;
		vm.type_CrearCuenta = 'logInLocal'
		$http.post("/api/users", {'password':vm.password_CrearCuenta, 'username':vm.UserName_CrearCuenta, 'email':vm.email_CrearCuenta, 'type':vm.type_CrearCuenta}).then(function(response) {
       		console.log(response.data)	
       		if (response.data.success == true) {
	       		$scope.validToken(response);
	       	}
   		});
	};

	$scope.checkLoginState = function(){
  		FB.login(function(response){
  			vm.type_CrearCuenta = 'logInFb'
  			if (response.status == "connected") {
  				$http.post("/api/session", {'oauth_Token':response.authResponse.accessToken, 'type':vm.type_CrearCuenta}).then(function(response) {
    				console.log(response.data)	
    				if (response.data.success == true) {
	    				$scope.validToken(response);
		       		}
   				});
  			}
		});
	};

	$scope.getUsers = function(){
		vm.notEvalToken = false;
		$http.get("/api/users").then(function(response){
			//Pendiente: poder iterar en cada user y iterar username y usar n-retpeat (no me ha saildo)
			console.log(response.data.records)
			vm.Users = response.data.records
			// angular.copy(response.data, vm.Users);
		});
	};

	$scope.getSessions = function(){
		vm.notEvalToken = false;
		$http.get("/api/session").then(function(response){
			console.log(response.data.records)
			vm.Sessions = response.data.records

		});
	};

	$scope.logInLocal = function(){
		vm.type_CrearCuenta = 'logInLocal';
		$http.post("/api/session", {'password':vm.password_IniciarSeSion, 'email':vm.email_IniciarSeSion, 'type':vm.type_CrearCuenta}).then(function(response) {
			if (response.data.success == true) {
				console.log(response.data)	
				$scope.validToken(response);
			}
   		});
	};

	$scope.logOut = function(){
		$http.delete("/api/session", {params: {'token':vm.token}}).then(function(response) {
			console.log(response.data)	
 
			if (response.data.active == 'no') {
				if (vm.type_CrearCuenta == 'logInGoogle') 
					gapi.auth2.getAuthInstance().signOut();
				
				$scope.invalidToken();
			}

   		});
	};

	
	$scope.sendToken = function(){

		if (vm.type_CrearCuenta == 'logInGoogle'){
			var auth2 = gapi.auth2.getAuthInstance();
			var isSignedIn = auth2.isSignedIn.get()
			//console.log(isSignedIn)
		}

		$http.post("/api/test", {'token':vm.token, 'type':vm.type_CrearCuenta, 'isSignedIn':isSignedIn}).then(function(response) {
			console.log(response.data)
			if (response.data.message == "Token(s) invalido") {
				$scope.invalidToken();
			}
					
   		});
	};


	$scope.logInGoogle = function (id_token) {
		//console.log(id_token)
		vm.type_CrearCuenta = 'logInGoogle';
		$http.post("/api/session", {'oauth_Token':id_token, 'type':vm.type_CrearCuenta}).then(function(response) {
			console.log(response.data)	
			if (response.data.success == true) {
				$scope.validToken(response);
       		}
   		});
	}

	$scope.invalidToken = function(){
		vm.token = '';
		vm.showCrearCuenta = true;
		vm.showIniciarSesion = true;
   		vm.cerrarSesionB = false;
   		vm.message = "¡Welcome Pitaya Soft!";
   		vm.picture = false;
	};

	$scope.validToken = function(response){
		vm.token = response.data.token; 	
	    vm.message = "Hola " + response.data.username + " \n¡Bienvenido!"
	    vm.showCrearCuenta = false;
		vm.showIniciarSesion = false;
	    vm.cerrarSesionB = true;
	    //No es mejor guardar la url e la foto del usuario en la BD ?? 
	    vm.picture = response.data.picture;
	};


	window.onbeforeunload = function (event) {
	    if (typeof(Storage) !== "undefined") {
		    localStorage.token = vm.token;
		    localStorage.type = vm.type_CrearCuenta

			localStorage.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()

		} else {
		    // Sorry! No Web Storage support..
		}
		//gapi.auth2.getAuthInstance().signOut();
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



