

// Crear modulo
// var app = angular.module("routerApp", ["routerRoutes"]);

var app = angular.module("routerApp", ['ngRoute'])
 
app.config(function($routeProvider, $locationProvider) {
    $routeProvider

    .when("/home", {
        templateURL  : "views/pages/home.html",
        controller   : 'homeController'
    })
    .when("/about", {
        templateUrl  :  "views/pages/about.html",
        controller   :  "aboutController",
		controllerAS :  "about"
    })
    .when("/contact", {
        templateUrl  : "views/pages/contact.html",
        controller   : "contactController",
		controllerAS : "contact"
    })

    $locationProvider.html5Mode(true)
 
})
 
//Crear el controlador
//Este es el controlar para todo el sitio
app.controller('mainController', function($scope){

	// var vm = this;

	$scope.bigMessage = 'Hello World!';
}) 

//Controlador para el home page!
app.controller('homeController', function($scope){

	var vm = this;

	$scope.message = 'This is the home page';
 
})
 
//Controlador para el about page!
app.controller('aboutController', function(){

	var vm = this;

	vm.message = 'This is the about page';
	
})

//Controlador para el contact page!
app.controller('contactController', function(){

	var vm = this;

	vm.message = 'This is the contact page';
	
})